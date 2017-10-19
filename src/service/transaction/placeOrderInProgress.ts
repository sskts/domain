/**
 * placeOrder in progress transaction service
 * 進行中注文取引サービス
 * @namespace service.transaction.placeOrderInProgress
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import * as moment from 'moment';

import { MongoRepository as AuthorizeActionRepository } from '../../repo/action/authorize';
import { MongoRepository as OrganizationRepository } from '../../repo/organization';
import { MongoRepository as TransactionRepository } from '../../repo/transaction';
import { MongoRepository as TransactionCountRepository } from '../../repo/transactionCount';

import * as CreditCardAuthorizeActionService from './placeOrderInProgress/action/authorize/creditCard';
import * as MvtkAuthorizeActionService from './placeOrderInProgress/action/authorize/mvtk';
import * as SeatReservationAuthorizeActionService from './placeOrderInProgress/action/authorize/seatReservation';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');

export type ITransactionOperation<T> = (transactionRepo: TransactionRepository) => Promise<T>;
export type IOrganizationAndTransactionAndTransactionCountOperation<T> = (
    organizationRepo: OrganizationRepository,
    transactionRepo: TransactionRepository,
    transactionCountRepository: TransactionCountRepository
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
 * 取引に対するアクション
 * @export
 * @memberof service.transaction.placeOrderInProgress
 */
export namespace action {
    /**
     * 取引に対する承認アクション
     * @export
     * @memberof service.transaction.placeOrderInProgress.action
     */
    export namespace authorize {
        /**
         * クレジットカード承認アクションサービス
         * @export
         * @memberof service.transaction.placeOrderInProgress.action.authorize
         */
        export import creditCard = CreditCardAuthorizeActionService;
        /**
         * ムビチケ承認アクションサービス
         * @export
         * @memberof service.transaction.placeOrderInProgress.action.authorize
         */
        export import mvtk = MvtkAuthorizeActionService;
        /**
         * 座席予約承認アクションサービス
         * @export
         * @memberof service.transaction.placeOrderInProgress.action.authorize
         */
        export import seatReservation = SeatReservationAuthorizeActionService;
    }
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
        authorizeActions = authorizeActions.filter(
            (authorizeAction) => (authorizeAction.endDate !== undefined && authorizeAction.endDate < now)
        );
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
        .filter((authorizeAction) => authorizeAction.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((authorizeAction) => authorizeAction.agent.id === transaction.agent.id)
        .reduce((a, b) => a + (<IAuthorizeActionResult>b.result).price, 0);
    const priceBySeller = transaction.object.authorizeActions
        .filter((authorizeAction) => authorizeAction.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((authorizeAction) => authorizeAction.agent.id === transaction.seller.id)
        .reduce((a, b) => a + (<IAuthorizeActionResult>b.result).price, 0);
    debug('priceByAgent priceBySeller:', priceByAgent, priceBySeller);

    return (priceByAgent > 0 && priceByAgent === priceBySeller);
}
