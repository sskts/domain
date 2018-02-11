/**
 * ムビチケ承認アクションサービス
 * @namespace service.transaction.placeOrderInProgress.action.authorize.mvtk
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as MvtkAuthorizeActionRepo } from '../../../../../repo/action/authorize/mvtk';
import { MongoRepository as SeatReservationAuthorizeActionRepo } from '../../../../../repo/action/authorize/seatReservation';
import { MongoRepository as TransactionRepo } from '../../../../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress:action:authorize:mvtk');

export type ISeatAndMvtkAndTransactionOperation<T> = (
    seatReservationAuthorizeActionRepo: SeatReservationAuthorizeActionRepo,
    mvtkAuthorizeActionRepo: MvtkAuthorizeActionRepo,
    transactionRepo: TransactionRepo
) => Promise<T>;

/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @memberof service.transaction.placeOrderInProgress
 */
export function create(
    agentId: string,
    transactionId: string,
    authorizeObject: factory.action.authorize.mvtk.IObject
): ISeatAndMvtkAndTransactionOperation<factory.action.authorize.mvtk.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (
        seatReservationAuthorizeActionRepo: SeatReservationAuthorizeActionRepo,
        mvtkAuthorizeActionRepo: MvtkAuthorizeActionRepo,
        transactionRepo: TransactionRepo
    ) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // 座席予約承認を取得
        // 座席予約承認アクションが存在していなければエラー
        const seatReservationAuthorizeActions = await seatReservationAuthorizeActionRepo.findByTransactionId(transactionId)
            .then((actions) => actions.filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus));
        if (seatReservationAuthorizeActions.length === 0) {
            throw new factory.errors.Argument('transactionId', '座席予約が見つかりません。');
        }
        // tslint:disable-next-line:no-suspicious-comment
        // TODO 座席予約承認はひとつしかない仕様ではあるが、万が一データとして複数存在した場合の挙動を考慮できていない
        const seatReservationAuthorizeAction = seatReservationAuthorizeActions[0];

        const seatReservationAuthorizeActionObject = seatReservationAuthorizeAction.object;
        const seatReservationAuthorizeActionResult =
            <factory.action.authorize.seatReservation.IResult>seatReservationAuthorizeAction.result;

        // 購入管理番号が一致しているか
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

        // サイトコードが一致しているか (COAの劇場コードから頭の0をとった値)
        // tslint:disable-next-line:no-magic-numbers
        const stCdShouldBe = parseInt(seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.theaterCode.slice(-2), 10).toString();
        if (authorizeObject.seatInfoSyncIn.stCd !== stCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'stCd not matched with seat reservation authorizeAction');
        }

        // 作品コードが一致しているか
        // ムビチケに渡す作品枝番号は、COAの枝番号を0埋めで二桁に揃えたもの、というのが、ムビチケ側の仕様なので、そのようにバリデーションをかけます。
        // tslint:disable-next-line:no-magic-numbers
        const titleBranchNum4mvtk = `0${seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.titleBranchNum}`.slice(-2);
        const skhnCdShouldBe = `${seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.titleCode}${titleBranchNum4mvtk}`;
        if (authorizeObject.seatInfoSyncIn.skhnCd !== skhnCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'skhnCd not matched with seat reservation authorizeAction');
        }

        // スクリーンコードが一致しているか
        if (authorizeObject.seatInfoSyncIn.screnCd !== seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.screenCode) {
            throw new factory.errors.Argument('authorizeActionResult', 'screnCd not matched with seat reservation authorizeAction');
        }

        // 座席番号が一致しているか
        const seatNumsInSeatReservationAuthorization =
            seatReservationAuthorizeActionResult.updTmpReserveSeatResult.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizeObject.seatInfoSyncIn.zskInfo.every(
            (zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0
        )) {
            throw new factory.errors.Argument('authorizeActionResult', 'zskInfo not matched with seat reservation authorizeAction');
        }

        const mvtkAuthorizeAction = await mvtkAuthorizeActionRepo.start(
            transaction.agent,
            transaction.seller,
            authorizeObject,
            { ...transaction, typeOf: <any>factory.action.authorize.authorizeActionPurpose.Mvtk }
        );

        // 特に何もしない

        // アクションを完了
        return mvtkAuthorizeActionRepo.complete(
            mvtkAuthorizeAction.id,
            {
                price: authorizeObject.price
            }
        );
    };
}

export function cancel(
    agentId: string,
    transactionId: string,
    actionId: string
) {
    return async (mvtkAuthorizeActionRepo: MvtkAuthorizeActionRepo, transactionRepo: TransactionRepo) => {
        const transaction = await transactionRepo.findPlaceOrderInProgressById(transactionId);

        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        await mvtkAuthorizeActionRepo.cancel(actionId, transactionId);

        // 特に何もしない
    };
}
