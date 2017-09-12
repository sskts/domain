import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as ActionRepository } from '../../repo/action';
import { MongoRepository as OrganizationRepository } from '../../repo/organization';
import { MongoRepository as TransactionRepository } from '../../repo/transaction';
import { MongoRepository as TransactionCountRepository } from '../../repo/transactionCount';
export declare type ITransactionOperation<T> = (transactionRepository: TransactionRepository) => Promise<T>;
export declare type IOrganizationAndTransactionAndTransactionCountOperation<T> = (organizationRepository: OrganizationRepository, transactionRepository: TransactionRepository, transactionCountRepository: TransactionCountRepository) => Promise<T>;
export declare type IActionAndTransactionOperation<T> = (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => Promise<T>;
export declare type IActionAndOrganizationAndTransactionOperation<T> = (actionRepository: ActionRepository, organizationRepository: OrganizationRepository, transactionRepository: TransactionRepository) => Promise<T>;
/**
 * 取引開始
 */
export declare function start(params: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: factory.clientUser.IClientUser;
    scope: factory.transactionScope.ITransactionScope;
    agentId: string;
    sellerId: string;
}): IOrganizationAndTransactionAndTransactionCountOperation<factory.transaction.placeOrder.ITransaction>;
/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export declare type ICreditCard4authorizeAction = factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw | factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized | factory.paymentMethod.paymentCard.creditCard.IUnauthorizedCardOfMember;
/**
 * クレジットカードオーソリ取得
 */
export declare function authorizeCreditCard(agentId: string, transactionId: string, orderId: string, amount: number, method: GMO.utils.util.Method, creditCard: ICreditCard4authorizeAction): IActionAndOrganizationAndTransactionOperation<factory.action.authorize.creditCard.IAction>;
export declare function cancelCreditCardAuth(agentId: string, transactionId: string, actionId: string): (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => Promise<void>;
export declare function authorizeSeatReservation(agentId: string, transactionId: string, individualScreeningEvent: factory.event.individualScreeningEvent.IEvent, offers: factory.offer.ISeatReservationOffer[]): IActionAndTransactionOperation<factory.action.authorize.seatReservation.IAction>;
export declare function cancelSeatReservationAuth(agentId: string, transactionId: string, actionId: string): (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => Promise<void>;
/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @memberof service.transaction.placeOrderInProgress
 */
export declare function authorizeMvtk(agentId: string, transactionId: string, authorizeObject: factory.action.authorize.mvtk.IObject): IActionAndTransactionOperation<factory.action.authorize.mvtk.IAction>;
export declare function cancelMvtkAuth(agentId: string, transactionId: string, actionId: string): (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => Promise<void>;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service.transaction.placeOrderInProgress
 */
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service.transaction.placeOrderInProgress
 */
/**
 * 取引中の購入者情報を変更する
 */
export declare function setCustomerContacts(agentId: string, transactionId: string, contact: factory.transaction.placeOrder.ICustomerContact): ITransactionOperation<void>;
/**
 * 取引確定
 */
export declare function confirm(agentId: string, transactionId: string): (actionRepository: ActionRepository, transactionRepository: TransactionRepository) => Promise<factory.order.IOrder>;
