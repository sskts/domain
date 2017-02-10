"use strict";
const authorizationGroup_1 = require("./authorizationGroup");
const transactionEventGroup_1 = require("./transactionEventGroup");
const monapt = require("monapt");
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
class Transaction {
    constructor(_id, status, events, owners, queues, expired_at, inquiry_key, queues_status) {
        this._id = _id;
        this.status = status;
        this.events = events;
        this.owners = owners;
        this.queues = queues;
        this.expired_at = expired_at;
        this.inquiry_key = inquiry_key;
        this.queues_status = queues_status;
        // TODO validation
    }
    /**
     * COA座席仮予約を取得する
     *
     * @returns {monapt.Option<COASeatReservationAuthorization>}
     *
     * @memberOf Transaction
     */
    getCoaSeatReservationAuthorization() {
        const coaAuthorization = this.authorizations().find((authorization) => {
            return (authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION);
        });
        return (coaAuthorization) ? monapt.Option(coaAuthorization) : monapt.None;
    }
    /**
     * イベントから承認リストを取得する
     *
     * @returns {Array<Authorization>}
     *
     * @memberOf Transaction
     */
    authorizations() {
        // 承認イベント
        const authorizations = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.AUTHORIZE;
        }).map((event) => {
            return event.authorization;
        });
        // 承認解除イベント
        const removedAuthorizationIds = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.UNAUTHORIZE;
        }).map((event) => {
            return event.authorization._id.toString();
        });
        return authorizations.filter((authorization) => {
            return removedAuthorizationIds.indexOf(authorization._id.toString()) < 0;
        });
    }
    /**
     * イベントから通知リストを取得する
     *
     * @returns {Array<Notification>}
     *
     * @memberOf Transaction
     */
    notifications() {
        const notifications = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.NOTIFICATION_ADD;
        }).map((event) => {
            return event.notification;
        });
        // メール削除イベント
        const removedNotificationIds = this.events.filter((event) => {
            return event.group === transactionEventGroup_1.default.NOTIFICATION_REMOVE;
        }).map((event) => {
            return event.notification._id.toString();
        });
        return notifications.filter((notification) => {
            return removedNotificationIds.indexOf(notification._id.toString()) < 0;
        });
    }
    /**
     * 照会可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    isInquiryAvailable() {
        return (this.inquiry_key);
    }
    /**
     * 成立可能かどうか
     *
     * @returns {boolean}
     *
     * @memberOf Transaction
     */
    canBeClosed() {
        const authorizations = this.authorizations();
        const pricesByOwner = {};
        authorizations.forEach((authorization) => {
            if (!pricesByOwner[authorization.owner_from.toString()])
                pricesByOwner[authorization.owner_from.toString()] = 0;
            if (!pricesByOwner[authorization.owner_to.toString()])
                pricesByOwner[authorization.owner_to.toString()] = 0;
            pricesByOwner[authorization.owner_from.toString()] -= authorization.price;
            pricesByOwner[authorization.owner_to.toString()] += authorization.price;
        });
        return Object.keys(pricesByOwner).every((ownerId) => {
            return pricesByOwner[ownerId] === 0;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
