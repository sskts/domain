/**
 * 進行中注文取引サービス
 */
import * as factory from '@motionpicture/sskts-factory';
import * as waiter from '@motionpicture/waiter-domain';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment-timezone';
import * as pug from 'pug';
import * as util from 'util';

import { MongoRepository as ActionRepo } from '../../repo/action';
import { MongoRepository as OrganizationRepo } from '../../repo/organization';
import { MongoRepository as TransactionRepo } from '../../repo/transaction';

import * as PecorinoAwardAuthorizeActionService from './placeOrderInProgress/action/authorize/award/pecorino';
import * as MvtkAuthorizeActionService from './placeOrderInProgress/action/authorize/discount/mvtk';
import * as ProgramMembershipAuthorizeActionService from './placeOrderInProgress/action/authorize/offer/programMembership';
import * as SeatReservationAuthorizeActionService from './placeOrderInProgress/action/authorize/offer/seatReservation';
import * as CreditCardAuthorizeActionService from './placeOrderInProgress/action/authorize/paymentMethod/creditCard';
import * as PecorinoAuthorizeActionService from './placeOrderInProgress/action/authorize/paymentMethod/pecorino';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');

export type ITransactionOperation<T> = (repos: { transaction: TransactionRepo }) => Promise<T>;
export type IOrganizationAndTransactionAndTransactionCountOperation<T> = (repos: {
    organization: OrganizationRepo;
    transaction: TransactionRepo;
}) => Promise<T>;

/**
 * 取引開始パラメーターインターフェース
 */
export interface IStartParams {
    /**
     * 取引期限
     */
    expires: Date;
    /**
     * 取引主体ID
     */
    agentId: string;
    /**
     * 販売者ID
     */
    sellerId: string;
    /**
     * APIクライアント
     */
    clientUser: factory.clientUser.IClientUser;
    /**
     * WAITER許可証トークン
     */
    passportToken?: waiter.factory.passport.IEncodedPassport;
}

/**
 * 取引開始
 */
export function start(params: IStartParams):
    IOrganizationAndTransactionAndTransactionCountOperation<factory.transaction.placeOrder.ITransaction> {
    return async (repos: {
        organization: OrganizationRepo;
        transaction: TransactionRepo;
    }) => {
        // 売り手を取得
        const seller = await repos.organization.findMovieTheaterById(params.sellerId);

        let passport: waiter.factory.passport.IPassport | undefined;

        // WAITER許可証トークンがあれば検証する
        if (params.passportToken !== undefined) {
            try {
                passport = await waiter.service.passport.verify(params.passportToken, <string>process.env.WAITER_SECRET);
            } catch (error) {
                throw new factory.errors.Argument('passportToken', `Invalid token. ${error.message}`);
            }

            // スコープを判別
            if (!validatePassport(passport, seller.identifier)) {
                throw new factory.errors.Argument('passportToken', 'Invalid passport.');
            }
        } else {
            // tslint:disable-next-line:no-suspicious-comment
            // TODO いったん許可証トークンなしでも通過するようにしているが、これでいいのかどうか。保留事項。
            // throw new factory.errors.ArgumentNull('passportToken');
            params.passportToken = moment().valueOf().toString(); // ユニークインデックスがDBにはられているため
            passport = <any>{};
        }

        const agent: factory.transaction.placeOrder.IAgent = {
            typeOf: factory.personType.Person,
            id: params.agentId,
            url: ''
        };
        if (params.clientUser.username !== undefined) {
            agent.memberOf = {
                typeOf: <factory.programMembership.ProgramMembershipType>'ProgramMembership',
                membershipNumber: params.agentId,
                programName: 'Amazon Cognito',
                award: []
            };
        }

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transactionAttributes = factory.transaction.placeOrder.createAttributes({
            status: factory.transactionStatusType.InProgress,
            agent: agent,
            seller: {
                typeOf: factory.organizationType.MovieTheater,
                id: seller.id,
                name: seller.name.ja,
                url: seller.url
            },
            object: {
                passportToken: params.passportToken,
                passport: <any>passport,
                clientUser: params.clientUser,
                authorizeActions: []
            },
            expires: params.expires,
            startDate: new Date(),
            tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
        });

        let transaction: factory.transaction.placeOrder.ITransaction;
        try {
            transaction = await repos.transaction.start(factory.transactionType.PlaceOrder, transactionAttributes);
        } catch (error) {
            if (error.name === 'MongoError') {
                // 許可証を重複使用しようとすると、MongoDBでE11000 duplicate key errorが発生する
                // name: 'MongoError',
                // message: 'E11000 duplicate key error collection: sskts-development-v2.transactions...',
                // code: 11000,

                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                // tslint:disable-next-line:no-magic-numbers
                if (error.code === 11000) {
                    throw new factory.errors.AlreadyInUse('transaction', ['passportToken'], 'Passport already used.');
                }
            }

            throw error;
        }

        return transaction;
    };
}

/**
 * WAITER許可証の有効性チェック
 * @param passport WAITER許可証
 * @param sellerIdentifier 販売者識別子
 */
function validatePassport(passport: waiter.factory.passport.IPassport, sellerIdentifier: string) {
    // スコープのフォーマットは、placeOrderTransaction.{sellerId}
    const explodedScopeStrings = passport.scope.split('.');

    return (
        passport.iss === <string>process.env.WAITER_PASSPORT_ISSUER && // 許可証発行者確認
        // tslint:disable-next-line:no-magic-numbers
        explodedScopeStrings.length === 2 &&
        explodedScopeStrings[0] === 'placeOrderTransaction' && // スコープ接頭辞確認
        explodedScopeStrings[1] === sellerIdentifier // 販売者識別子確認
    );
}

/**
 * 取引に対するアクション
 * @export
 */
export namespace action {
    /**
     * 取引に対する承認アクション
     */
    export namespace authorize {
        export namespace award {
            export import pecorino = PecorinoAwardAuthorizeActionService;
        }
        export namespace discount {
            /**
             * ムビチケ承認アクションサービス
             */
            export import mvtk = MvtkAuthorizeActionService;
        }
        export namespace offer {
            /**
             * 会員プログラム承認アクションサービス
             */
            export import programMembership = ProgramMembershipAuthorizeActionService;
            /**
             * 座席予約承認アクションサービス
             */
            export import seatReservation = SeatReservationAuthorizeActionService;
        }
        export namespace paymentMethod {
            /**
             * クレジットカード承認アクションサービス
             */
            export import creditCard = CreditCardAuthorizeActionService;
            /**
             * Pecorino承認アクションサービス
             */
            export import pecorino = PecorinoAuthorizeActionService;
        }
    }
}

/**
 * 取引中の購入者情報を変更する
 */
export function setCustomerContact(params: {
    agentId: string;
    transactionId: string;
    contact: factory.transaction.placeOrder.ICustomerContact;
}): ITransactionOperation<factory.transaction.placeOrder.ICustomerContact> {
    return async (repos: { transaction: TransactionRepo }) => {
        let formattedTelephone: string;
        try {
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(params.contact.telephone, 'JP'); // 日本の電話番号前提仕様
            if (!phoneUtil.isValidNumber(phoneNumber)) {
                throw new Error('invalid phone number format.');
            }

            formattedTelephone = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
        } catch (error) {
            throw new factory.errors.Argument('contact.telephone', error.message);
        }

        // 連絡先を再生成(validationの意味も含めて)
        const customerContact: factory.transaction.placeOrder.ICustomerContact = {
            familyName: params.contact.familyName,
            givenName: params.contact.givenName,
            email: params.contact.email,
            telephone: formattedTelephone
        };

        const transaction = await repos.transaction.findInProgressById(factory.transactionType.PlaceOrder, params.transactionId);

        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        await repos.transaction.setCustomerContactOnPlaceOrderInProgress(params.transactionId, customerContact);

        return customerContact;
    };
}

/**
 * 取引確定
 */
// tslint:disable-next-line:max-func-body-length
export function confirm(params: {
    /**
     * 取引進行者ID
     */
    agentId: string;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 注文メールを送信するかどうか
     */
    sendEmailMessage?: boolean;
}) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        transaction: TransactionRepo;
        organization: OrganizationRepo;
    }) => {
        const now = moment().toDate();
        const transaction = await repos.transaction.findInProgressById(factory.transactionType.PlaceOrder, params.transactionId);
        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        const seller = await repos.organization.findMovieTheaterById(transaction.seller.id);
        debug('seller found.', seller.identifier);

        const customerContact = transaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.NotFound('customerContact');
        }

        // 取引に対する全ての承認アクションをマージ
        let authorizeActions = await repos.action.findAuthorizeByTransactionId(params.transactionId);

        // 万が一このプロセス中に他処理が発生してもそれらを無視するように、endDateでフィルタリング
        authorizeActions = authorizeActions.filter((a) => (a.endDate !== undefined && a.endDate < now));
        transaction.object.authorizeActions = authorizeActions;

        // 照会可能になっているかどうか
        validateTransaction(transaction);

        // 結果作成
        const order = createOrderFromTransaction({
            transaction: transaction,
            orderDate: now,
            orderStatus: factory.orderStatus.OrderProcessing,
            isGift: false,
            seller: seller
        });

        // tslint:disable-next-line:max-line-length
        type IOwnershipInfo = factory.ownershipInfo.IOwnershipInfo<factory.ownershipInfo.IGoodType>;
        const ownershipInfos: IOwnershipInfo[] = order.acceptedOffers.map((acceptedOffer) => {
            if (acceptedOffer.itemOffered.typeOf === 'ProgramMembership') {
                const programMembership = acceptedOffer.itemOffered;
                const identifier = `${acceptedOffer.itemOffered.typeOf}-${moment().valueOf()}`;

                // どういう期間でいくらのオファーなのか
                const eligibleDuration = acceptedOffer.eligibleDuration;
                if (eligibleDuration === undefined) {
                    throw new factory.errors.NotFound('Order.acceptedOffers.eligibleDuration');
                }
                // 期間単位としては秒のみ実装
                if (eligibleDuration.unitCode !== factory.unitCode.Sec) {
                    throw new factory.errors.NotImplemented('Only \'SEC\' is implemented for eligibleDuration.unitCode ');
                }
                const ownedThrough = moment(now).add(eligibleDuration.value, 'seconds').toDate();

                return {
                    typeOf: <factory.ownershipInfo.OwnershipInfoType>'OwnershipInfo',
                    identifier: identifier,
                    ownedBy: {
                        id: transaction.agent.id,
                        typeOf: transaction.agent.typeOf,
                        name: order.customer.name
                    },
                    acquiredFrom: transaction.seller,
                    ownedFrom: now,
                    ownedThrough: ownedThrough,
                    typeOfGood: programMembership
                };
            } else {
                // ownershipInfoのidentifierはコレクション内でuniqueである必要があるので、この仕様には要注意
                // saveする際に、identifierでfindOneAndUpdateしている
                const identifier = `${acceptedOffer.itemOffered.typeOf}-${acceptedOffer.itemOffered.reservedTicket.ticketToken}`;

                return {
                    typeOf: <factory.ownershipInfo.OwnershipInfoType>'OwnershipInfo',
                    identifier: identifier,
                    ownedBy: {
                        id: transaction.agent.id,
                        typeOf: transaction.agent.typeOf,
                        name: order.customer.name
                    },
                    acquiredFrom: transaction.seller,
                    ownedFrom: now,
                    // イベント予約に対する所有権の有効期限はイベント終了日時までで十分だろう
                    // 現時点では所有権対象がイベント予約のみなので、これで問題ないが、
                    // 対象が他に広がれば、有効期間のコントロールは別でしっかり行う必要があるだろう
                    ownedThrough: acceptedOffer.itemOffered.reservationFor.endDate,
                    typeOfGood: acceptedOffer.itemOffered
                };
            }
        });

        // クレジットカード支払いアクション
        let payCreditCardAction: factory.action.trade.pay.IAttributes<factory.paymentMethodType.CreditCard> | null = null;
        const creditCardPayment = order.paymentMethods.find((m) => m.paymentMethod === factory.paymentMethodType.CreditCard);
        if (creditCardPayment !== undefined) {
            payCreditCardAction = {
                typeOf: factory.actionType.PayAction,
                object: {
                    paymentMethod: <factory.order.IPaymentMethod<factory.paymentMethodType.CreditCard>>creditCardPayment,
                    price: order.price,
                    priceCurrency: order.priceCurrency
                },
                agent: transaction.agent,
                purpose: order
            };
        }

        // Pecorino支払いアクション
        const pecorinotAuthorizeActions = <factory.action.authorize.paymentMethod.pecorino.IAction[]>transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.object.typeOf === factory.action.authorize.paymentMethod.pecorino.ObjectType.PecorinoPayment);
        const payPecorinoActions: factory.action.trade.pay.IAttributes<factory.paymentMethodType.Pecorino>[] =
            pecorinotAuthorizeActions.map((a) => {
                return {
                    typeOf: <factory.actionType.PayAction>factory.actionType.PayAction,
                    object: {
                        paymentMethod: {
                            name: 'Pecorino',
                            paymentMethod: <factory.paymentMethodType.Pecorino>factory.paymentMethodType.Pecorino,
                            paymentMethodId: a.id
                        },
                        pecorinoTransaction: (<factory.action.authorize.paymentMethod.pecorino.IResult>a.result).pecorinoTransaction,
                        pecorinoEndpoint: (<factory.action.authorize.paymentMethod.pecorino.IResult>a.result).pecorinoEndpoint
                    },
                    agent: transaction.agent,
                    purpose: order
                };
            });

        // ムビチケ使用アクション
        let useMvtkAction: factory.action.consume.use.mvtk.IAttributes | null = null;
        const mvtkAuthorizeAction = <factory.action.authorize.discount.mvtk.IAction>transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .find((a) => a.object.typeOf === factory.action.authorize.discount.mvtk.ObjectType.Mvtk);
        if (mvtkAuthorizeAction !== undefined) {
            useMvtkAction = {
                typeOf: factory.actionType.UseAction,
                object: {
                    typeOf: factory.action.consume.use.mvtk.ObjectType.Mvtk,
                    seatInfoSyncIn: mvtkAuthorizeAction.object.seatInfoSyncIn
                },
                agent: transaction.agent,
                purpose: order
            };
        }

        // Pecorino口座使用ユーザーであればインセンティブ付与
        // Pecorinoインセンティブに対する承認アクションの分だけ、Pecorinoインセンティブ付与アクションを作成する
        // tslint:disable-next-line:no-suspicious-comment
        // TODO インセンティブ付与条件が「会員だったら」になっているが、雑なので調整すべし
        let givePecorinoAwardActions: factory.action.transfer.give.pecorinoAward.IAttributes[] = [];
        if (transaction.agent.memberOf !== undefined) {
            const pecorinoAwardAuthorizeActions = (<factory.action.authorize.award.pecorino.IAction[]>transaction.object.authorizeActions)
                .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                .filter((a) => a.object.typeOf === factory.action.authorize.award.pecorino.ObjectType.PecorinoAward);
            givePecorinoAwardActions = pecorinoAwardAuthorizeActions.map((a) => {
                const actionResult = <factory.action.authorize.award.pecorino.IResult>a.result;

                return {
                    typeOf: <factory.actionType.GiveAction>factory.actionType.GiveAction,
                    agent: transaction.seller,
                    recipient: transaction.agent,
                    object: {
                        typeOf: factory.action.transfer.give.pecorinoAward.ObjectType.PecorinoAward,
                        pecorinoTransaction: actionResult.pecorinoTransaction,
                        pecorinoEndpoint: actionResult.pecorinoEndpoint
                    },
                    purpose: order
                };
            });
        }

        const result: factory.transaction.placeOrder.IResult = {
            order: order,
            ownershipInfos: ownershipInfos
        };

        // メール送信ONであれば送信アクション属性を生成
        // tslint:disable-next-line:no-suspicious-comment
        // TODO メール送信アクションをセットする
        // 現時点では、フロントエンドからメール送信タスクを作成しているので不要
        let sendEmailMessageActionAttributes: factory.action.transfer.send.message.email.IAttributes | null = null;
        if (params.sendEmailMessage === true) {
            const emailMessage = await createEmailMessageFromTransaction({
                transaction: transaction,
                customerContact: customerContact,
                order: order,
                seller: seller
            });
            sendEmailMessageActionAttributes = {
                typeOf: factory.actionType.SendAction,
                object: emailMessage,
                agent: transaction.seller,
                recipient: transaction.agent,
                potentialActions: {},
                purpose: order
            };
        }

        // 会員プログラムが注文アイテムにあれば、プログラム更新タスクを追加
        const registerProgramMembershipTaskAttributes: factory.task.registerProgramMembership.IAttributes[] = [];
        const programMembershipOffers = <factory.order.IAcceptedOffer<factory.programMembership.IProgramMembership>[]>
            order.acceptedOffers.filter(
                (o) => o.itemOffered.typeOf === <factory.programMembership.ProgramMembershipType>'ProgramMembership'
            );
        if (programMembershipOffers.length > 0) {
            registerProgramMembershipTaskAttributes.push(...programMembershipOffers.map((o) => {
                const actionAttributes: factory.action.interact.register.programMembership.IAttributes = {
                    typeOf: factory.actionType.RegisterAction,
                    agent: transaction.agent,
                    object: o
                };

                // どういう期間でいくらのオファーなのか
                const eligibleDuration = o.eligibleDuration;
                if (eligibleDuration === undefined) {
                    throw new factory.errors.NotFound('Order.acceptedOffers.eligibleDuration');
                }
                // 期間単位としては秒のみ実装
                if (eligibleDuration.unitCode !== factory.unitCode.Sec) {
                    throw new factory.errors.NotImplemented('Only \'SEC\' is implemented for eligibleDuration.unitCode ');
                }
                // プログラム更新日時は、今回のプログラムの所有期限
                const runsAt = moment(now).add(eligibleDuration.value, 'seconds').toDate();

                return {
                    name: <factory.taskName.RegisterProgramMembership>factory.taskName.RegisterProgramMembership,
                    status: factory.taskStatus.Ready,
                    runsAt: runsAt,
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: actionAttributes
                };
            }));
        }

        const sendOrderActionAttributes: factory.action.transfer.send.order.IAttributes = {
            typeOf: factory.actionType.SendAction,
            object: order,
            agent: transaction.seller,
            recipient: transaction.agent,
            potentialActions: {
                sendEmailMessage: (sendEmailMessageActionAttributes !== null) ? sendEmailMessageActionAttributes : undefined,
                registerProgramMembership: registerProgramMembershipTaskAttributes
            }
        };
        const potentialActions: factory.transaction.placeOrder.IPotentialActions = {
            order: {
                typeOf: factory.actionType.OrderAction,
                object: order,
                agent: transaction.agent,
                potentialActions: {
                    // クレジットカード決済があれば支払アクション追加
                    payCreditCard: (payCreditCardAction !== null) ? payCreditCardAction : undefined,
                    // Pecorino決済があれば支払アクション追加
                    payPecorino: payPecorinoActions,
                    useMvtk: (useMvtkAction !== null) ? useMvtkAction : undefined,
                    sendOrder: sendOrderActionAttributes,
                    givePecorinoAward: givePecorinoAwardActions
                }
            }
        };

        // ステータス変更
        debug('updating transaction...');
        await repos.transaction.confirmPlaceOrder(
            params.transactionId,
            authorizeActions,
            result,
            potentialActions
        );

        return order;
    };
}

/**
 * 取引が確定可能な状態かどうかをチェックする
 */
export function validateTransaction(transaction: factory.transaction.placeOrder.ITransaction) {
    type IAuthorizeActionResult =
        factory.action.authorize.paymentMethod.creditCard.IResult |
        factory.action.authorize.discount.mvtk.IResult |
        factory.action.authorize.offer.seatReservation.IResult |
        factory.action.authorize.paymentMethod.pecorino.IResult;

    // クレジットカードオーソリをひとつに限定
    const creditCardAuthorizeActions = transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard);
    if (creditCardAuthorizeActions.length > 1) {
        throw new factory.errors.Argument('transactionId', 'The number of credit card authorize actions must be one.');
    }

    // ムビチケ着券情報をひとつに限定
    const mvtkAuthorizeActions = transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.discount.mvtk.ObjectType.Mvtk);
    if (mvtkAuthorizeActions.length > 1) {
        throw new factory.errors.Argument('transactionId', 'The number of mvtk authorize actions must be one.');
    }

    // agentとsellerで、承認アクションの金額が合うかどうか
    const priceByAgent = transaction.object.authorizeActions
        .filter((authorizeAction) => authorizeAction.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((authorizeAction) => authorizeAction.agent.id === transaction.agent.id)
        .reduce((a, b) => a + (<IAuthorizeActionResult>b.result).price, 0);
    const priceBySeller = transaction.object.authorizeActions
        .filter((authorizeAction) => authorizeAction.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((authorizeAction) => authorizeAction.agent.id === transaction.seller.id)
        .reduce((a, b) => a + (<IAuthorizeActionResult>b.result).price, 0);
    debug('priceByAgent priceBySeller:', priceByAgent, priceBySeller);

    // ポイント鑑賞券によって必要なポイントがどのくらいあるか算出
    let requiredPoint = 0;
    const seatReservationAuthorizeActions = <factory.action.authorize.offer.seatReservation.IAction[]>transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation);
    if (seatReservationAuthorizeActions.length > 1) {
        throw new factory.errors.Argument('transactionId', 'The number of seat reservation authorize actions must be one.');
    }
    const seatReservationAuthorizeAction = seatReservationAuthorizeActions.shift();
    if (seatReservationAuthorizeAction !== undefined) {
        requiredPoint = (<factory.action.authorize.offer.seatReservation.IResult>seatReservationAuthorizeAction.result).pecorinoAmount;
        // 必要ポイントがある場合、Pecorinoのオーソリ金額と比較
        if (requiredPoint > 0) {
            const authorizedPecorinoAmount =
                (<factory.action.authorize.paymentMethod.pecorino.IAction[]>transaction.object.authorizeActions)
                    .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                    .filter((a) => a.object.typeOf === factory.action.authorize.paymentMethod.pecorino.ObjectType.PecorinoPayment)
                    .reduce((a, b) => a + b.object.amount, 0);
            if (requiredPoint !== authorizedPecorinoAmount) {
                throw new factory.errors.Argument('transactionId', 'Required pecorino amount not satisfied.');
            }
        }
    }

    // JPYオーソリ金額もPecorinoオーソリポイントも0より大きくなければ取引成立不可
    if (priceByAgent <= 0 && requiredPoint <= 0) {
        throw new factory.errors.Argument('transactionId', 'Price or point must be over 0.');
    }

    if (priceByAgent !== priceBySeller) {
        throw new factory.errors.Argument('transactionId', 'Transaction cannot be confirmed because prices are not matched.');
    }
}

/**
 * create order object from transaction parameters
 * 取引オブジェクトから注文オブジェクトを生成する
 * @export
 */
// tslint:disable-next-line:max-func-body-length
export function createOrderFromTransaction(params: {
    transaction: factory.transaction.placeOrder.ITransaction;
    orderDate: Date;
    orderStatus: factory.orderStatus;
    isGift: boolean;
    seller: factory.organization.movieTheater.IOrganization;
}): factory.order.IOrder {
    // 座席予約に対する承認アクション取り出す
    const seatReservationAuthorizeActions = params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation);
    if (seatReservationAuthorizeActions.length > 1) {
        throw new factory.errors.NotImplemented('Number of seat reservation authorizeAction must be 1.');
    }
    const seatReservationAuthorizeAction = seatReservationAuthorizeActions.shift();
    // if (seatReservationAuthorizeAction === undefined) {
    //     throw new factory.errors.Argument('transaction', 'Seat reservation does not exist.');
    // }

    // 会員プログラムに対する承認アクションを取り出す
    const programMembershipAuthorizeActions = params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === 'Offer')
        .filter((a) => a.object.itemOffered.typeOf === 'ProgramMembership');
    if (programMembershipAuthorizeActions.length > 1) {
        throw new factory.errors.NotImplemented('Number of programMembership authorizeAction must be 1.');
    }
    const programMembershipAuthorizeAction = programMembershipAuthorizeActions.shift();
    // if (seatReservationAuthorizeAction === undefined) {
    //     throw new factory.errors.Argument('transaction', 'Seat reservation does not exist.');
    // }

    if (params.transaction.object.customerContact === undefined) {
        throw new factory.errors.Argument('transaction', 'Customer contact does not exist');
    }

    const cutomerContact = params.transaction.object.customerContact;
    const seller: factory.order.ISeller = params.transaction.seller;
    const customer: factory.order.ICustomer = {
        ...{
            id: params.transaction.agent.id,
            typeOf: params.transaction.agent.typeOf,
            name: `${cutomerContact.familyName} ${cutomerContact.givenName}`,
            url: ''
        },
        ...params.transaction.object.customerContact
    };
    if (params.transaction.agent.memberOf !== undefined) {
        customer.memberOf = params.transaction.agent.memberOf;
    }

    let orderInquiryKey = {
        theaterCode: params.seller.location.branchCode,
        confirmationNumber: moment().unix(),
        telephone: cutomerContact.telephone
    };

    const acceptedOffers: factory.order.IAcceptedOffer<factory.order.IItemOffered>[] = [];
    let orderNumber = '';

    // 座席予約がある場合
    if (seatReservationAuthorizeAction !== undefined) {
        if (seatReservationAuthorizeAction.result === undefined) {
            throw new factory.errors.Argument('transaction', 'Seat reservation result does not exist.');
        }

        orderInquiryKey = {
            theaterCode: seatReservationAuthorizeAction.result.updTmpReserveSeatArgs.theaterCode,
            confirmationNumber: seatReservationAuthorizeAction.result.updTmpReserveSeatResult.tmpReserveNum,
            telephone: cutomerContact.telephone
        };

        // 座席仮予約から容認供給情報を生成する
        // 座席予約以外の注文アイテムが追加された場合は、このロジックに修正が加えられることになる
        acceptedOffers.push(...factory.reservation.event.createFromCOATmpReserve({
            updTmpReserveSeatResult: seatReservationAuthorizeAction.result.updTmpReserveSeatResult,
            offers: seatReservationAuthorizeAction.object.offers,
            individualScreeningEvent: seatReservationAuthorizeAction.object.individualScreeningEvent
        }).map((eventReservation) => {
            eventReservation.reservationStatus = factory.reservationStatusType.ReservationConfirmed;
            eventReservation.underName.name = {
                ja: customer.name,
                en: customer.name
            };
            eventReservation.reservedTicket.underName.name = {
                ja: customer.name,
                en: customer.name
            };

            return {
                typeOf: <factory.offer.OfferType>'Offer',
                itemOffered: eventReservation,
                price: eventReservation.price,
                priceCurrency: factory.priceCurrency.JPY,
                seller: {
                    typeOf: seatReservationAuthorizeAction.object.individualScreeningEvent.superEvent.location.typeOf,
                    name: seatReservationAuthorizeAction.object.individualScreeningEvent.superEvent.location.name.ja
                }
            };
        }));

        // 注文番号生成
        orderNumber = util.format(
            '%s-%s-%s',
            moment(params.orderDate).tz('Asia/Tokyo').format('YYMMDD'),
            orderInquiryKey.theaterCode,
            orderInquiryKey.confirmationNumber
        );
    }

    // 会員プログラムがある場合
    if (programMembershipAuthorizeAction !== undefined) {
        acceptedOffers.push(programMembershipAuthorizeAction.object);

        // 注文番号生成
        orderNumber = util.format(
            'PM%s-%s-%s',
            moment(params.orderDate).tz('Asia/Tokyo').format('YYMMDD'),
            orderInquiryKey.theaterCode,
            orderInquiryKey.confirmationNumber
        );
    }

    // 結果作成
    const discounts: factory.order.IDiscount[] = [];
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.discount.mvtk.ObjectType.Mvtk)
        .forEach((mvtkAuthorizeAction: factory.action.authorize.discount.mvtk.IAction) => {
            const discountCode = mvtkAuthorizeAction.object.seatInfoSyncIn.knyknrNoInfo.map(
                (knshInfo) => knshInfo.knyknrNo
            ).join(',');

            discounts.push({
                name: 'ムビチケカード',
                discount: (<factory.action.authorize.discount.mvtk.IResult>mvtkAuthorizeAction.result).price,
                discountCode: discountCode,
                discountCurrency: factory.priceCurrency.JPY
            });
        });

    const paymentMethods: factory.order.IPaymentMethod<factory.paymentMethodType>[] = [];

    // クレジットカード決済があれば決済方法に追加
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.paymentMethod.creditCard.ObjectType.CreditCard)
        .forEach((creditCardAuthorizeAction: factory.action.authorize.paymentMethod.creditCard.IAction) => {
            const actionResult = <factory.action.authorize.paymentMethod.creditCard.IResult>creditCardAuthorizeAction.result;
            paymentMethods.push({
                name: 'クレジットカード',
                paymentMethod: factory.paymentMethodType.CreditCard,
                paymentMethodId: actionResult.execTranResult.orderId
            });
        });

    // pecorino決済があれば決済方法に追加
    params.transaction.object.authorizeActions
        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((a) => a.object.typeOf === factory.action.authorize.paymentMethod.pecorino.ObjectType.PecorinoPayment)
        .forEach((pecorinoAuthorizeAction: factory.action.authorize.paymentMethod.pecorino.IAction) => {
            const actionResult = <factory.action.authorize.paymentMethod.pecorino.IResult>pecorinoAuthorizeAction.result;
            paymentMethods.push({
                name: 'Pecorino',
                paymentMethod: factory.paymentMethodType.Pecorino,
                paymentMethodId: actionResult.pecorinoTransaction.id
            });
        });

    return {
        typeOf: 'Order',
        seller: seller,
        customer: customer,
        price: acceptedOffers.reduce((a, b) => a + b.price, 0) - discounts.reduce((a, b) => a + b.discount, 0),
        priceCurrency: factory.priceCurrency.JPY,
        paymentMethods: paymentMethods,
        discounts: discounts,
        confirmationNumber: orderInquiryKey.confirmationNumber,
        orderNumber: orderNumber,
        acceptedOffers: acceptedOffers,
        // tslint:disable-next-line:max-line-length
        url: `${process.env.ORDER_INQUIRY_ENDPOINT}/inquiry/login?theater=${orderInquiryKey.theaterCode}&reserve=${orderInquiryKey.confirmationNumber}`,
        orderStatus: params.orderStatus,
        orderDate: params.orderDate,
        isGift: params.isGift,
        orderInquiryKey: orderInquiryKey
    };
}

export async function createEmailMessageFromTransaction(params: {
    transaction: factory.transaction.placeOrder.ITransaction;
    customerContact: factory.transaction.placeOrder.ICustomerContact;
    order: factory.order.IOrder;
    seller: factory.organization.movieTheater.IOrganization;
}): Promise<factory.creativeWork.message.email.ICreativeWork> {
    return new Promise<factory.creativeWork.message.email.ICreativeWork>((resolve, reject) => {
        const seller = params.transaction.seller;
        if (params.order.acceptedOffers[0].itemOffered.typeOf === factory.reservationType.EventReservation) {
            const event = (<factory.reservation.event.IEventReservation<any>>params.order.acceptedOffers[0].itemOffered).reservationFor;

            pug.renderFile(
                `${__dirname}/../../../emails/sendOrder/text.pug`,
                {
                    familyName: params.customerContact.familyName,
                    givenName: params.customerContact.givenName,
                    confirmationNumber: params.order.confirmationNumber,
                    eventStartDate: util.format(
                        '%s - %s',
                        moment(event.startDate).locale('ja').tz('Asia/Tokyo').format('YYYY年MM月DD日(ddd) HH:mm'),
                        moment(event.endDate).tz('Asia/Tokyo').format('HH:mm')
                    ),
                    workPerformedName: event.workPerformed.name,
                    screenName: event.location.name.ja,
                    reservedSeats: params.order.acceptedOffers.map((o) => {
                        return util.format(
                            '%s %s ￥%s',
                            (<factory.reservation.event.IEventReservation<any>>o.itemOffered).reservedTicket.ticketedSeat.seatNumber,
                            (<factory.reservation.event.IEventReservation<any>>o.itemOffered).reservedTicket.coaTicketInfo.ticketName,
                            (<factory.reservation.event.IEventReservation<any>>o.itemOffered).reservedTicket.coaTicketInfo.salePrice
                        );
                    }).join('\n'),
                    price: params.order.price,
                    inquiryUrl: params.order.url,
                    sellerName: params.order.seller.name,
                    sellerTelephone: params.seller.telephone
                },
                (renderMessageErr, message) => {
                    if (renderMessageErr instanceof Error) {
                        reject(renderMessageErr);

                        return;
                    }

                    debug('message:', message);
                    pug.renderFile(
                        `${__dirname}/../../../emails/sendOrder/subject.pug`,
                        {
                            sellerName: params.order.seller.name
                        },
                        (renderSubjectErr, subject) => {
                            if (renderSubjectErr instanceof Error) {
                                reject(renderSubjectErr);

                                return;
                            }

                            debug('subject:', subject);

                            resolve(factory.creativeWork.message.email.create({
                                identifier: `placeOrderTransaction-${params.transaction.id}`,
                                sender: {
                                    typeOf: seller.typeOf,
                                    name: seller.name,
                                    email: 'noreply@ticket-cinemasunshine.com'
                                },
                                toRecipient: {
                                    typeOf: params.transaction.agent.typeOf,
                                    name: `${params.customerContact.familyName} ${params.customerContact.givenName}`,
                                    email: params.customerContact.email
                                },
                                about: subject,
                                text: message
                            }));
                        }
                    );
                }
            );
        }
    });
}
