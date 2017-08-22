import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';
import OrganizationAdapter from '../../adapter/organization';
import TaskAdapter from '../../adapter/task';
import TransactionAdapter from '../../adapter/transaction';
import TransactionCountAdapter from '../../adapter/transactionCount';
export declare type ITransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type ITaskAndTransactionOperation<T> = (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type IOrganizationAndTransactionOperation<T> = (organizationAdapter: OrganizationAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type IOrganizationAndTransactionAndTransactionCountOperation<T> = (organizationAdapter: OrganizationAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<T>;
/**
 * 取引開始
 */
export declare function start(args: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: factory.clientUser.IClientUser;
    scope: factory.transactionScope.ITransactionScope;
    agentId?: string;
    sellerId: string;
}): IOrganizationAndTransactionAndTransactionCountOperation<monapt.Option<factory.transaction.placeOrder.ITransaction>>;
/**
 * 取引を期限切れにする
 */
export declare function makeExpired(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ひとつの取引のタスクをエクスポートする
 */
export declare function exportTasks(status: factory.transactionStatusType): (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ID指定で取引のタスク出力
 */
export declare function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]>;
/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export declare function reexportTasks(intervalInMinutes: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 進行中の取引を取得する
 */
export declare function findInProgressById(transactionId: string): ITransactionOperation<monapt.Option<factory.transaction.placeOrder.ITransaction>>;
/**
 * 生のクレジットカード情報
 */
export interface ICreditCard4authorizationRaw {
    cardNo: string;
    expire: string;
    securityCode: string;
}
/**
 * トークン化されたクレジットカード情報
 */
export interface ICreditCard4authorizationTokenized {
    token: string;
}
/**
 * 会員のクレジットカード情報
 */
export interface ICreditCard4authorizationOfMember {
    memberId: string;
    cardSeq: number;
    cardPass?: string;
}
/**
 * オーソリを取得するクレジットカード情報インターフェース
 */
export declare type ICreditCard4authorization = ICreditCard4authorizationRaw | ICreditCard4authorizationTokenized | ICreditCard4authorizationOfMember;
/**
 * クレジットカードオーソリ取得
 */
export declare function createCreditCardAuthorization(transactionId: string, orderId: string, amount: number, method: GMO.utils.util.Method, creditCard: ICreditCard4authorization): IOrganizationAndTransactionOperation<factory.authorization.gmo.IAuthorization>;
export declare function cancelGMOAuthorization(transactionId: string, authorizationId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 座席予約販売情報インターフェース
 */
export interface ISeatReservationOffer {
    /**
     * 座席セクション
     */
    seatSection: string;
    /**
     * 座席番号
     */
    seatNumber: string;
    /**
     * 券種情報
     */
    ticket: factory.reservation.ICOATicketInfo;
}
export declare function createSeatReservationAuthorization(transactionId: string, individualScreeningEvent: factory.event.individualScreeningEvent.IEvent, offers: ISeatReservationOffer[]): ITransactionOperation<factory.authorization.seatReservation.IAuthorization>;
export declare function cancelSeatReservationAuthorization(transactionId: string, authorizationId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ムビチケ着券承認追加
 *
 * @param {string} transactionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @memberof service/transaction/placeOrder
 */
export declare function createMvtkAuthorization(transactionId: string, authorization: factory.authorization.mvtk.IAuthorization): (transactionAdapter: TransactionAdapter) => Promise<void>;
export declare function cancelMvtkAuthorization(transactionId: string, authorizationId: string): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 */
export declare function setAgentProfile(transactionId: string, profile: factory.person.IProfile): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * 会員情報をGMO会員として保管する
 *
 * @param {MemberOwnerFactory.IMemberOwner} memberOwner 会員所有者
 */
/**
 * 取引中の所有者に対してカード情報を保管する
 *
 * @export
 * @param {string} transactionId 取引ID
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} gmoCard GMOカード情報
 * @returns {TransactionOperation<void>} 取引に対する操作
 */
/**
 * 取引確定
 */
export declare function confirm(transactionId: string): (transactionAdapter: TransactionAdapter) => Promise<factory.order.IOrder>;
