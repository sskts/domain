/**
 * placeOrder in progress transaction service
 * 進行中注文取引サービス
 * @namespace service.transaction.placeOrderInProgress
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment';

import { MongoRepository as AuthorizeActionRepository } from '../../repo/action/authorize';
import { MongoRepository as OrganizationRepository } from '../../repo/organization';
import { MongoRepository as TransactionRepository } from '../../repo/transaction';
import { MongoRepository as TransactionCountRepository } from '../../repo/transactionCount';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');

export type ITransactionOperation<T> = (transactionRepo: TransactionRepository) => Promise<T>;
export type IOrganizationAndTransactionAndTransactionCountOperation<T> = (
    organizationRepo: OrganizationRepository,
    transactionRepo: TransactionRepository,
    transactionCountRepository: TransactionCountRepository
) => Promise<T>;
export type IActionAndTransactionOperation<T> = (
    authorizeActionRepo: AuthorizeActionRepository,
    transactionRepo: TransactionRepository
) => Promise<T>;
export type IActionAndOrganizationAndTransactionOperation<T> = (
    authorizeActionRepo: AuthorizeActionRepository,
    organizationRepo: OrganizationRepository,
    transactionRepo: TransactionRepository
) => Promise<T>;

/**
 * 取引開始
 */
export function start(params: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: factory.clientUser.IClientUser;
    scope: factory.transactionScope.ITransactionScope;
    agentId: string;
    sellerId: string;
}): IOrganizationAndTransactionAndTransactionCountOperation<factory.transaction.placeOrder.ITransaction> {
    return async (
        organizationRepo: OrganizationRepository,
        transactionRepo: TransactionRepository,
        transactionCountRepository: TransactionCountRepository
    ) => {
        // 利用可能かどうか
        const nextCount = await transactionCountRepository.incr(params.scope);
        if (nextCount > params.maxCountPerUnit) {
            throw new factory.errors.ServiceUnavailable('Transactions temporarily unavailable.');
        }

        const agent: factory.transaction.placeOrder.IAgent = {
            typeOf: 'Person',
            id: params.agentId,
            url: ''
        };
        if (params.clientUser.username !== undefined) {
            agent.memberOf = {
                membershipNumber: params.agentId,
                programName: 'Amazon Cognito'
            };
        }

        // 売り手を取得
        const seller = await organizationRepo.findMovieTheaterById(params.sellerId);

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transactionAttributes = factory.transaction.placeOrder.createAttributes({
            status: factory.transactionStatusType.InProgress,
            agent: agent,
            seller: {
                // tslint:disable-next-line:no-suspicious-comment
                // TODO enum管理
                typeOf: 'MovieTheater',
                id: seller.id,
                name: seller.name.ja,
                url: seller.url
            },
            object: {
                clientUser: params.clientUser,
                authorizeActions: []
            },
            expires: params.expires,
            startDate: new Date(),
            tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
        });

        return await transactionRepo.startPlaceOrder(transactionAttributes);
    };
}

/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export type ICreditCard4authorizeAction =
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw |
    factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized |
    factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;

/**
 * クレジットカードオーソリ取得
 */
export function authorizeCreditCard(
    agentId: string,
    transactionId: string,
    orderId: string,
    amount: number,
    method: GMO.utils.util.Method,
    creditCard: ICreditCard4authorizeAction
): IActionAndOrganizationAndTransactionOperation<factory.action.authorize.creditCard.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        authorizeActionRepo: AuthorizeActionRepository,
        organizationRepo: OrganizationRepository,
        transactionRepo: TransactionRepository
    ) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // GMOショップ情報取得
        const movieTheater = await organizationRepo.findMovieTheaterById(transaction.seller.id);

        // 承認アクションを開始する
        const action = await authorizeActionRepo.startCreditCard(
            transaction.agent,
            transaction.seller,
            {
                transactionId: transactionId,
                orderId: orderId,
                amount: amount,
                method: method,
                payType: GMO.utils.util.PayType.Credit
            }
        );

        // GMOオーソリ取得
        let entryTranArgs: GMO.services.credit.IEntryTranArgs;
        let execTranArgs: GMO.services.credit.IExecTranArgs;
        let entryTranResult: GMO.services.credit.IEntryTranResult;
        let execTranResult: GMO.services.credit.IExecTranResult;
        try {
            entryTranArgs = {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                jobCd: GMO.utils.util.JobCd.Auth,
                amount: amount
            };
            entryTranResult = await GMO.services.credit.entryTran(entryTranArgs);
            debug('entryTranResult:', entryTranResult);

            execTranArgs = {
                ...{
                    accessId: entryTranResult.accessId,
                    accessPass: entryTranResult.accessPass,
                    orderId: orderId,
                    method: method,
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS
                },
                ...creditCard,
                ...{
                    seqMode: GMO.utils.util.SeqMode.Physics
                }
            };
            execTranResult = await GMO.services.credit.execTran(execTranArgs);
            debug('execTranResult:', execTranResult);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                await authorizeActionRepo.giveUp(action.id, error);
            } catch (__) {
                // 失敗したら仕方ない
            }

            if (error.name === 'GMOServiceBadRequestError') {
                // consider E92000001,E92000002
                // GMO流量制限オーバーエラーの場合
                const serviceUnavailableError = error.errors.find((gmoError: any) => gmoError.info.match(/^E92000001|E92000002$/));
                if (serviceUnavailableError !== undefined) {
                    throw new factory.errors.ServiceUnavailable(serviceUnavailableError.userMessage);
                }

                // オーダーID重複エラーの場合
                const duplicateError = error.errors.find((gmoError: any) => gmoError.info.match(/^E01040010$/));
                if (duplicateError !== undefined) {
                    throw new factory.errors.AlreadyInUse('action.object', ['orderId'], duplicateError.userMessage);
                }

                console.error('authorizeCreditCard threw', error);

                // その他のGMOエラーに場合、なんらかのクライアントエラー
                throw new factory.errors.Argument('payment');
            }

            console.error('authorizeCreditCard threw', error);

            throw new Error(error);
        }

        // アクションを完了
        debug('ending authorize action...');

        return await authorizeActionRepo.completeCreditCard(
            action.id,
            {
                price: amount,
                entryTranArgs: entryTranArgs,
                execTranArgs: execTranArgs,
                execTranResult: execTranResult
            }
        );
    };
}

export function cancelCreditCardAuth(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (authorizeActionRepo: AuthorizeActionRepository, transactionRepo: TransactionRepository) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const action = await authorizeActionRepo.cancelCreditCard(actionId, transactionId);
        const actionResult = <factory.action.authorize.creditCard.IResult>action.result;

        // オーソリ取消
        // 現時点では、ここで失敗したらオーソリ取消をあきらめる
        // リトライするには処理を非同期に変更する必要あり
        try {
            await GMO.services.credit.alterTran({
                shopId: actionResult.entryTranArgs.shopId,
                shopPass: actionResult.entryTranArgs.shopPass,
                accessId: actionResult.execTranArgs.accessId,
                accessPass: actionResult.execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Void
            });
            debug('alterTran processed', GMO.utils.util.JobCd.Void);
        } catch (error) {
            console.error('cancelCreditCardAuth threw', error);
            // tslint:disable-next-line:no-suspicious-comment
            // TODO GMO混雑エラーを判別(取消処理でも混雑エラーが発生することは確認済)
        }
    };
}

/**
 * 座席予約に対する承認アクションを開始する前の処理
 * 供給情報の有効性の確認などを行う。
 * この処理次第で、どのような供給情報を受け入れられるかが決定するので、とても大事な処理です。
 * バグ、不足等あれば、随時更新することが望ましい。
 * @function
 * @param transaction 注文取引オブジェクト
 * @param individualScreeningEvent 上映イベント
 * @param offers 供給情報
 */
async function preAuthorizeSeatReservation(
    transaction: factory.transaction.placeOrder.ITransaction,
    individualScreeningEvent: factory.event.individualScreeningEvent.IEvent,
    offers: factory.offer.ISeatReservationOffer[]
): Promise<void> {
    // 会員？
    const isMember = (transaction.agent.memberOf !== undefined);

    // 供給情報が適切かどうか確認
    const availableSalesTickets: COA.services.reserve.ISalesTicketResult[] = [];

    // COA券種取得(非会員)
    const salesTickets4nonMember = await COA.services.reserve.salesTicket({
        theaterCode: individualScreeningEvent.coaInfo.theaterCode,
        dateJouei: individualScreeningEvent.coaInfo.dateJouei,
        titleCode: individualScreeningEvent.coaInfo.titleCode,
        titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum,
        timeBegin: individualScreeningEvent.coaInfo.timeBegin,
        flgMember: COA.services.reserve.FlgMember.NonMember
    });
    availableSalesTickets.push(...salesTickets4nonMember);

    // COA券種取得(会員)
    if (isMember) {
        const salesTickets4member = await COA.services.reserve.salesTicket({
            theaterCode: individualScreeningEvent.coaInfo.theaterCode,
            dateJouei: individualScreeningEvent.coaInfo.dateJouei,
            titleCode: individualScreeningEvent.coaInfo.titleCode,
            titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum,
            timeBegin: individualScreeningEvent.coaInfo.timeBegin,
            flgMember: COA.services.reserve.FlgMember.Member
        });
        availableSalesTickets.push(...salesTickets4member);
    }

    debug('availableSalesTickets:', availableSalesTickets);

    // 利用可能でないチケットコードが供給情報に含まれていれば引数エラー
    // 供給情報ごとに確認
    await Promise.all(offers.map(async (offer) => {
        // ムビチケの場合
        if (offer.ticketInfo.mvtkAppPrice > 0) {
            // ムビチケ情報をCOA券種に変換
            debug('finding mvtkTicket...', offer.ticketInfo.ticketCode);
            const mvtkTicket = await COA.services.master.mvtkTicketcode({
                theaterCode: individualScreeningEvent.coaInfo.theaterCode,
                kbnDenshiken: offer.ticketInfo.mvtkKbnDenshiken,
                kbnMaeuriken: offer.ticketInfo.mvtkKbnMaeuriken,
                kbnKensyu: offer.ticketInfo.mvtkKbnKensyu,
                salesPrice: offer.ticketInfo.mvtkSalesPrice,
                appPrice: offer.ticketInfo.mvtkAppPrice,
                kbnEisyahousiki: offer.ticketInfo.kbnEisyahousiki,
                titleCode: individualScreeningEvent.coaInfo.titleCode,
                titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum
            });

            if (offer.ticketInfo.ticketCode !== mvtkTicket.ticketCode) {
                throw new factory.errors.NotFound('offers', `ticketCode ${offer.ticketInfo.ticketCode} not found.`);
            }

            offer.ticketInfo.ticketName = mvtkTicket.ticketName;
            offer.ticketInfo.ticketNameEng = mvtkTicket.ticketNameEng;
            offer.ticketInfo.ticketNameKana = mvtkTicket.ticketNameKana;
            offer.ticketInfo.stdPrice = 0;
            offer.ticketInfo.addPrice = mvtkTicket.addPrice;
            offer.ticketInfo.disPrice = 0;
            offer.ticketInfo.salePrice = mvtkTicket.addPrice;
            offer.ticketInfo.addGlasses = mvtkTicket.addPriceGlasses;
        } else {
            const availableSalesTicket = availableSalesTickets.find(
                (salesTicket) => salesTicket.ticketCode === offer.ticketInfo.ticketCode
            );
            if (availableSalesTicket === undefined) {
                throw new factory.errors.NotFound('offers', `ticketCode ${offer.ticketInfo.ticketCode} not found.`);
            }

            offer.ticketInfo.ticketName = availableSalesTicket.ticketName;
            offer.ticketInfo.ticketNameEng = availableSalesTicket.ticketNameEng;
            offer.ticketInfo.ticketNameKana = availableSalesTicket.ticketNameKana;
            offer.ticketInfo.stdPrice = availableSalesTicket.stdPrice;
            offer.ticketInfo.addPrice = availableSalesTicket.addPrice;
            offer.ticketInfo.salePrice = availableSalesTicket.salePrice;
            offer.ticketInfo.addGlasses = availableSalesTicket.addGlasses;
            offer.ticketInfo.mvtkAppPrice = 0; // ムビチケを使用しない場合の初期値をセット
            offer.ticketInfo.mvtkKbnDenshiken = '00'; // ムビチケを使用しない場合の初期値をセット
            offer.ticketInfo.mvtkKbnKensyu = '00'; // ムビチケを使用しない場合の初期値をセット
            offer.ticketInfo.mvtkKbnMaeuriken = '00'; // ムビチケを使用しない場合の初期値をセット
            offer.ticketInfo.mvtkNum = ''; // ムビチケを使用しない場合の初期値をセット
            offer.ticketInfo.mvtkSalesPrice = 0; // ムビチケを使用しない場合の初期値をセット
        }
    }));
}

/**
 * 座席を仮予約する
 * 承認アクションオブジェクトが返却されます。
 * @export
 * @function
 * @memberof service.transaction.placeOrderInProgress
 * @param {string} agentId 取引主体ID
 * @param {string} transactionId 取引ID
 * @param {factory.event.individualScreeningEvent.IEvent} individualScreeningEvent 上映イベント
 * @param {factory.offer.ISeatReservationOffer[]} offers 供給情報
 */
export function authorizeSeatReservation(
    agentId: string,
    transactionId: string,
    individualScreeningEvent: factory.event.individualScreeningEvent.IEvent,
    offers: factory.offer.ISeatReservationOffer[]
): IActionAndTransactionOperation<factory.action.authorize.seatReservation.IAction> {
    return async (authorizeActionRepo: AuthorizeActionRepository, transactionRepo: TransactionRepository) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 供給情報の有効性を確認
        await preAuthorizeSeatReservation(transaction, individualScreeningEvent, offers);

        // 承認アクションを開始
        const action = await authorizeActionRepo.startSeatReservation(
            transaction.seller,
            transaction.agent,
            {
                transactionId: transactionId,
                offers: offers,
                individualScreeningEvent: individualScreeningEvent
            }
        );

        // COA仮予約
        const updTmpReserveSeatArgs = {
            theaterCode: individualScreeningEvent.coaInfo.theaterCode,
            dateJouei: individualScreeningEvent.coaInfo.dateJouei,
            titleCode: individualScreeningEvent.coaInfo.titleCode,
            titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum,
            timeBegin: individualScreeningEvent.coaInfo.timeBegin,
            screenCode: individualScreeningEvent.coaInfo.screenCode,
            listSeat: offers.map((offer) => {
                return {
                    seatSection: offer.seatSection,
                    seatNum: offer.seatNumber
                };
            })
        };
        let updTmpReserveSeatResult: COA.services.reserve.IUpdTmpReserveSeatResult;
        try {
            debug('updTmpReserveSeat processing...', updTmpReserveSeatArgs);
            updTmpReserveSeatResult = await COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
            debug('updTmpReserveSeat processed', updTmpReserveSeatResult);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                await authorizeActionRepo.giveUp(action.id, error);
            } catch (__) {
                // 失敗したら仕方ない
            }

            // COAはクライアントエラーかサーバーエラーかに関わらずステータスコード500を返却する。メッセージ「座席取得失敗」の場合は、座席の重複とみなす
            if (error.message === '座席取得失敗') {
                throw new factory.errors.AlreadyInUse('action.object', ['offers'], error.message);
            }

            console.error('authorizeSeatReservation threw', error);

            throw new factory.errors.ServiceUnavailable('reserve service temporarily unavailable.');
        }

        // COAオーソリ追加
        // アクションを完了
        debug('ending authorize action...');
        const price = offers.reduce((a, b) => a + b.ticketInfo.salePrice + b.ticketInfo.mvtkSalesPrice, 0);

        return await authorizeActionRepo.completeSeatReservation(
            action.id,
            {
                price: price,
                updTmpReserveSeatArgs: updTmpReserveSeatArgs,
                updTmpReserveSeatResult: updTmpReserveSeatResult
            }
        );
    };
}

export function cancelSeatReservationAuth(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (authorizeActionRepo: AuthorizeActionRepository, transactionRepo: TransactionRepository) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // MongoDBでcompleteステータスであるにも関わらず、COAでは削除されている、というのが最悪の状況
        // それだけは回避するためにMongoDBを先に変更
        const action = await authorizeActionRepo.cancelSeatReservation(actionId, transactionId);
        const actionResult = <factory.action.authorize.seatReservation.IResult>action.result;

        // 座席仮予約削除
        debug('delTmpReserve processing...', action);
        await COA.services.reserve.delTmpReserve({
            theaterCode: actionResult.updTmpReserveSeatArgs.theaterCode,
            dateJouei: actionResult.updTmpReserveSeatArgs.dateJouei,
            titleCode: actionResult.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: actionResult.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: actionResult.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: actionResult.updTmpReserveSeatResult.tmpReserveNum
        });
        debug('delTmpReserve processed');
    };
}

/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @memberof service.transaction.placeOrderInProgress
 */
export function authorizeMvtk(
    agentId: string,
    transactionId: string,
    authorizeObject: factory.action.authorize.mvtk.IObject
): IActionAndTransactionOperation<factory.action.authorize.mvtk.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (authorizeActionRepo: AuthorizeActionRepository, transactionRepo: TransactionRepository) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 座席予約承認を取得
        // seatReservationAuthorization already exists?
        const seatReservationAuthorizeAction = await authorizeActionRepo.findSeatReservationByTransactionId(transactionId);
        const seatReservationAuthorizeActionObject = seatReservationAuthorizeAction.object;
        const seatReservationAuthorizeActionResult =
            <factory.action.authorize.seatReservation.IResult>seatReservationAuthorizeAction.result;

        // knyknrNo matched?
        interface IKnyknrNoNumsByNo { [knyknrNo: string]: number; }
        const knyknrNoNumsByNoShouldBe: IKnyknrNoNumsByNo = seatReservationAuthorizeActionObject.offers.reduce(
            (a: IKnyknrNoNumsByNo, b) => {
                const knyknrNo = b.ticketInfo.mvtkNum;
                // 券種情報にムビチケ購入管理番号があれば、枚数を追加
                if (typeof knyknrNo === 'string' && knyknrNo !== '') {
                    // tslint:disable-next-line:no-single-line-block-comment
                    /* istanbul ignore else */
                    if (a[knyknrNo] === undefined) {
                        a[knyknrNo] = 0;
                    }
                    a[knyknrNo] += 1;
                }

                return a;
            },
            {}
        );
        const knyknrNoNumsByNo: IKnyknrNoNumsByNo = authorizeObject.seatInfoSyncIn.knyknrNoInfo.reduce(
            (a: IKnyknrNoNumsByNo, b) => {
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                if (a[b.knyknrNo] === undefined) {
                    a[b.knyknrNo] = 0;
                }
                const knyknrNoNum = b.knshInfo.reduce((a2, b2) => a2 + b2.miNum, 0);
                a[b.knyknrNo] += knyknrNoNum;

                return a;
            },
            {}
        );
        debug('knyknrNoNumsByNo:', knyknrNoNumsByNo);
        debug('knyyknrNoNumsByNoShouldBe:', knyknrNoNumsByNoShouldBe);
        const knyknrNoExistsInSeatReservation =
            Object.keys(knyknrNoNumsByNo).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        const knyknrNoExistsMvtkResult =
            Object.keys(knyknrNoNumsByNoShouldBe).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        if (!knyknrNoExistsInSeatReservation || !knyknrNoExistsMvtkResult) {
            throw new factory.errors.Argument('authorizeActionResult', 'knyknrNoInfo not matched with seat reservation authorizeAction');
        }

        // stCd matched? (last two figures of theater code)
        // tslint:disable-next-line:no-magic-numbers
        const stCdShouldBe = seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.theaterCode.slice(-2);
        if (authorizeObject.seatInfoSyncIn.stCd !== stCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'stCd not matched with seat reservation authorizeAction');
        }

        // skhnCd matched?
        // ムビチケに渡す作品枝番号は、COAの枝番号を0埋めで二桁に揃えたもの、というのが、ムビチケ側の仕様なので、そのようにバリデーションをかけます。
        // tslint:disable-next-line:no-magic-numbers
        const titleBranchNum4mvtk = `0${seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.titleBranchNum}`.slice(-2);
        const skhnCdShouldBe = `${seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.titleCode}${titleBranchNum4mvtk}`;
        if (authorizeObject.seatInfoSyncIn.skhnCd !== skhnCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'skhnCd not matched with seat reservation authorizeAction');
        }

        // screen code matched?
        if (authorizeObject.seatInfoSyncIn.screnCd !== seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.screenCode) {
            throw new factory.errors.Argument('authorizeActionResult', 'screnCd not matched with seat reservation authorizeAction');
        }

        // seat num matched?
        const seatNumsInSeatReservationAuthorization =
            seatReservationAuthorizeActionResult.updTmpReserveSeatResult.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizeObject.seatInfoSyncIn.zskInfo.every(
            (zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0
        )) {
            throw new factory.errors.Argument('authorizeActionResult', 'zskInfo not matched with seat reservation authorizeAction');
        }

        const action = await authorizeActionRepo.startMvtk(
            transaction.agent,
            transaction.seller,
            authorizeObject
        );

        // 特に何もしない

        // アクションを完了
        return await authorizeActionRepo.completeMvtk(
            action.id,
            {
                price: authorizeObject.price
            }
        );
    };
}

export function cancelMvtkAuth(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (authorizeActionRepo: AuthorizeActionRepository, transactionRepo: TransactionRepository) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        await authorizeActionRepo.cancelMvtk(actionId, transactionId);

        // 特に何もしない
    };
}

/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service.transaction.placeOrderInProgress
 */
// export function addEmail(transactionId: string, notification: EmailNotificationFactory.INotification) {
//     return async (transactionRepo: TransactionRepository) => {
//         // イベント作成
//         const event = AddNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: notification
//         });

//         // 永続化
//         debug('adding an event...', event);
//         await pushEvent(transactionId, event)(transactionRepo);
//     };
// }

/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service.transaction.placeOrderInProgress
 */
// export function removeEmail(transactionId: string, notificationId: string) {
//     return async (transactionRepo: TransactionRepository) => {
//         const transaction = await findInProgressById(transactionId)(transactionRepo)
//             .then((option) => {
//                 if (option.isEmpty) {
//                     throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
//                 }

//                 return option.get();
//             });

//         type ITransactionEvent = AddNotificationTransactionEventFactory.ITransactionEvent<EmailNotificationFactory.INotification>;
//         const addNotificationTransactionEvent = <ITransactionEvent>transaction.object.actionEvents.find(
//             (actionEvent) =>
//                 actionEvent.actionEventType === TransactionEventGroup.AddNotification &&
//                 (<ITransactionEvent>actionEvent).notification.id === notificationId
//         );
//         if (addNotificationTransactionEvent === undefined) {
//             throw new factory.errors.Argument('notificationId', `notification [${notificationId}] not found in the transaction.`);
//         }

//         // イベント作成
//         const event = RemoveNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: addNotificationTransactionEvent.notification
//         });

//         // 永続化
//         await pushEvent(transactionId, event)(transactionRepo);
//     };
// }

/**
 * 取引中の購入者情報を変更する
 */
export function setCustomerContact(
    agentId: string,
    transactionId: string,
    contact: factory.transaction.placeOrder.ICustomerContact
): ITransactionOperation<factory.transaction.placeOrder.ICustomerContact> {
    return async (transactionRepo: TransactionRepository) => {
        let formattedTelephone: string;
        try {
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(contact.telephone, 'JP'); // 日本の電話番号前提仕様
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                throw new Error('invalid phone number format.');
            }

            formattedTelephone = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
        } catch (error) {
            throw new factory.errors.Argument('contact.telephone', error.message);
        }

        // 連絡先を再生成(validationの意味も含めて)
        contact = {
            familyName: contact.familyName,
            givenName: contact.givenName,
            email: contact.email,
            telephone: formattedTelephone
        };

        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        await transactionRepo.setCustomerContactOnPlaceOrderInProgress(transactionId, contact);

        return contact;
    };
}

/**
 * 取引確定
 */
export function confirm(
    agentId: string,
    transactionId: string
) {
    // tslint:disable-next-line:max-func-body-length
    return async (authorizeActionRepo: AuthorizeActionRepository, transactionRepo: TransactionRepository) => {
        const now = new Date();
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // authorizeActionsを取得
        let authorizeActions = await authorizeActionRepo.findByTransactionId(transactionId);
        // 万が一このプロセス中に他処理が発生しても無視するように
        authorizeActions = authorizeActions.filter((action) => (action.endDate !== undefined && action.endDate < now));
        transaction.object.authorizeActions = authorizeActions;

        // 照会可能になっているかどうか
        if (!canBeClosed(transaction)) {
            throw new factory.errors.Argument('transactionId', 'Transaction cannot be confirmed because prices are not matched.');
        }

        // 結果作成
        const order = factory.order.createFromPlaceOrderTransaction({
            transaction: transaction,
            orderDate: now,
            orderStatus: factory.orderStatus.OrderDelivered,
            isGift: false
        });
        const ownershipInfos = order.acceptedOffers.map((acceptedOffer) => {
            // ownershipInfoのidentifierはコレクション内でuniqueである必要があるので、この仕様には要注意
            // saveする際に、identifierでfindOneAndUpdateしている
            const identifier = `${acceptedOffer.itemOffered.typeOf}-${acceptedOffer.itemOffered.reservedTicket.ticketToken}`;

            return factory.ownershipInfo.create({
                identifier: identifier,
                ownedBy: {
                    id: transaction.agent.id,
                    typeOf: transaction.agent.typeOf,
                    name: order.customer.name
                },
                acquiredFrom: transaction.seller,
                ownedFrom: now,
                // tslint:disable-next-line:no-suspicious-comment
                ownedThrough: moment(now).add(1, 'month').toDate(), // TODO 所有権の有効期間調整
                typeOfGood: acceptedOffer.itemOffered
            });
        });
        const result: factory.transaction.placeOrder.IResult = {
            order: order,
            ownershipInfos: ownershipInfos
        };

        // ステータス変更
        debug('updating transaction...');
        await transactionRepo.confirmPlaceOrder(
            transactionId,
            now,
            authorizeActions,
            result
        );

        return order;
    };
}

/**
 * whether a transaction can be closed
 * @function
 * @returns {boolean}
 */
function canBeClosed(transaction: factory.transaction.placeOrder.ITransaction) {
    type IAuthorizeActionResult =
        factory.action.authorize.creditCard.IResult |
        factory.action.authorize.mvtk.IResult |
        factory.action.authorize.seatReservation.IResult;

    const priceByAgent = transaction.object.authorizeActions
        .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((action) => action.agent.id === transaction.agent.id)
        .reduce((a, b) => a + (<IAuthorizeActionResult>b.result).price, 0);
    const priceBySeller = transaction.object.authorizeActions
        .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((action) => action.agent.id === transaction.seller.id)
        .reduce((a, b) => a + (<IAuthorizeActionResult>b.result).price, 0);
    debug('priceByAgent priceBySeller:', priceByAgent, priceBySeller);

    return (priceByAgent > 0 && priceByAgent === priceBySeller);
}
