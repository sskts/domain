/// <reference types="mongoose" />
/**
 * 取引イベントファクトリー
 *
 * @namespace TransactionEventFactory
 */
import Authorization from "../model/authorization";
import Notification from "../model/notification";
import ObjectId from "../model/objectId";
import TransactionEvent from "../model/transactionEvent";
import AuthorizeTransactionEvent from "../model/transactionEvent/authorize";
import NotificationAddTransactionEvent from "../model/transactionEvent/notificationAdd";
import NotificationRemoveTransactionEvent from "../model/transactionEvent/notificationRemove";
import UnauthorizeTransactionEvent from "../model/transactionEvent/unauthorize";
import TransactionEventGroup from "../model/transactionEventGroup";
export declare function create(args: {
    _id: ObjectId;
    group: TransactionEventGroup;
    occurred_at: Date;
}): TransactionEvent;
export declare function createAuthorize(args: {
    _id: ObjectId;
    occurred_at: Date;
    authorization: Authorization;
}): AuthorizeTransactionEvent;
export declare function createUnauthorize(args: {
    _id: ObjectId;
    occurred_at: Date;
    authorization: Authorization;
}): UnauthorizeTransactionEvent;
export declare function createNotificationAdd<T extends Notification>(args: {
    _id: ObjectId;
    occurred_at: Date;
    notification: T;
}): NotificationAddTransactionEvent<T>;
export declare function createNotificationRemove<T extends Notification>(args: {
    _id: ObjectId;
    occurred_at: Date;
    notification: T;
}): NotificationRemoveTransactionEvent<T>;
