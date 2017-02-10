/// <reference types="mongoose" />
import Authorization from "../model/authorization";
import Notification from "../model/notification";
import ObjectId from "../model/objectId";
import TransactionEvent from "../model/transactionEvent";
import AuthorizeTransactionEvent from "../model/transactionEvent/authorize";
import NotificationAddTransactionEvent from "../model/transactionEvent/notificationAdd";
import NotificationRemoveTransactionEvent from "../model/transactionEvent/notificationRemove";
import UnauthorizeTransactionEvent from "../model/transactionEvent/unauthorize";
import TransactionEventGroup from "../model/transactionEventGroup";
/**
 * 取引イベントファクトリー
 *
 * @namespace
 */
declare namespace TransactionEventFactory {
    function create(args: {
        _id: ObjectId;
        group: TransactionEventGroup;
        occurred_at: Date;
    }): TransactionEvent;
    function createAuthorize(args: {
        _id: ObjectId;
        occurred_at: Date;
        authorization: Authorization;
    }): AuthorizeTransactionEvent;
    function createUnauthorize(args: {
        _id: ObjectId;
        occurred_at: Date;
        authorization: Authorization;
    }): UnauthorizeTransactionEvent;
    function createNotificationAdd<T extends Notification>(args: {
        _id: ObjectId;
        occurred_at: Date;
        notification: T;
    }): NotificationAddTransactionEvent<T>;
    function createNotificationRemove<T extends Notification>(args: {
        _id: ObjectId;
        occurred_at: Date;
        notification: T;
    }): NotificationRemoveTransactionEvent<T>;
}
export default TransactionEventFactory;
