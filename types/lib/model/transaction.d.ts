/// <reference types="mongoose" />
import Authorization from "./authorization";
import COASeatReservationAuthorization from "./authorization/coaSeatReservation";
import Notification from "./notification";
import ObjectId from "./objectId";
import Owner from "./owner";
import Queue from "./queue";
import TransactionEvent from "./transactionEvent";
import TransactionInquiryKey from "./transactionInquiryKey";
import TransactionQueuesStatus from "./transactionQueuesStatus";
import TransactionStatus from "./transactionStatus";
import monapt = require("monapt");
/**
 * 取引
 *
 * @class Transaction
 *
 * @param {ObjectId} _id
 * @param {TransactionStatus} status
 * @param {Array<TransactionEvent>} events
 * @param {Array<Owner>} owners
 * @param {Array<Queue>} queues
 * @param {Date} expired_at
 * @param {string} inquiry_theater
 * @param {string} inquiry_id
 * @param {string} inquiry_pass
 * @param {TransactionQueuesStatus} queues_status
 */
export default class Transaction {
    readonly _id: ObjectId;
    readonly status: TransactionStatus;
    readonly events: TransactionEvent[];
    readonly owners: Owner[];
    readonly queues: Queue[];
    readonly expired_at: Date;
    readonly inquiry_key: TransactionInquiryKey | null;
    readonly queues_status: TransactionQueuesStatus;
    constructor(_id: ObjectId, status: TransactionStatus, events: TransactionEvent[], owners: Owner[], queues: Queue[], expired_at: Date, inquiry_key: TransactionInquiryKey | null, queues_status: TransactionQueuesStatus);
    /**
     * COA座席仮予約を取得する
     *
     * @returns {monapt.Option<COASeatReservationAuthorization>}
     *
     * @memberOf Transaction
     */
    getCoaSeatReservationAuthorization(): monapt.Option<COASeatReservationAuthorization>;
    /**
     * イベントから承認リストを取得する
     *
     * @returns {Array<Authorization>}
     *
     * @memberOf Transaction
     */
    authorizations(): Authorization[];
    /**
     * イベントから通知リストを取得する
     *
     * @returns {Array<Notification>}
     *
     * @memberOf Transaction
     */
    notifications(): Notification[];
    /**
     * 照会可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    isInquiryAvailable(): TransactionInquiryKey | null;
    /**
     * 成立可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    canBeClosed(): boolean;
}
