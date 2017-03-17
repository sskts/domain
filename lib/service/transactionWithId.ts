/**
 * 取引(ID指定)サービス
 *
 * @namespace TransactionWithIdService
 */
import * as createDebug from 'debug';
import * as monapt from 'monapt';

import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import OwnerGroup from '../factory/ownerGroup';
import * as Transaction from '../factory/transaction';
import * as TransactionEvent from '../factory/transactionEvent';
import * as TransactionInquiryKey from '../factory/transactionInquiryKey';
import transactionStatus from '../factory/transactionStatus';

import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';

export type TransactionAndQueueOperation<T> =
    (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export type OwnerAndTransactionOperation<T> =
    (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:transaction');

/**
 * IDから取得する
 *
 * @param {string} id
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export function findById(id: string): TransactionOperation<monapt.Option<Transaction.ITransaction>> {
    return async (transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        return (doc) ? monapt.Option(<Transaction.ITransaction>doc.toObject()) : monapt.None;
    };
}

/**
 * GMO資産承認
 *
 * @param {string} transactionId
 * @param {GMOAuthorization} authorization
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function addGMOAuthorization(transactionId: string, authorization: Authorization.IGMOAuthorization) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }
        const transaction = <Transaction.ITransaction>doc.toObject();

        // 所有者が取引に存在するかチェック
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id;
        });
        if (ownerIds.indexOf(authorization.owner_from) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }

        // イベント作成
        const event = TransactionEvent.createAuthorize({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * COA資産承認
 *
 * @param {string} transactionId
 * @param {COASeatReservationAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function addCOASeatReservationAuthorization(transactionId: string, authorization: Authorization.ICOASeatReservationAuthorization) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }
        const transaction = <Transaction.ITransaction>doc.toObject();

        const ownerIds = transaction.owners.map((owner) => {
            return owner.id;
        });
        if (ownerIds.indexOf(authorization.owner_from) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`);
        }
        if (ownerIds.indexOf(authorization.owner_to) < 0) {
            throw new Error(`transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`);
        }

        // イベント作成
        const event = TransactionEvent.createAuthorize({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * 資産承認解除
 *
 * @param {string} transactionId
 * @param {string} authorizationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function removeAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }

        const authorizations = await transactionAdapter.findAuthorizationsById(doc.get('id'));

        const removedAuthorization = authorizations.find((authorization) => authorization.id === authorizationId);
        if (!removedAuthorization) {
            throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = TransactionEvent.createUnauthorize({
            transaction: doc.get('id'),
            occurred_at: new Date(),
            authorization: removedAuthorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function addEmail(transactionId: string, notification: Notification.IEmailNotification) {
    return async (transactionAdapter: TransactionAdapter) => {
        // イベント作成
        const event = TransactionEvent.createNotificationAdd({
            transaction: transactionId,
            occurred_at: new Date(),
            notification: notification
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function removeEmail(transactionId: string, notificationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }

        const notifications = await transactionAdapter.findNotificationsById(doc.get('id'));

        const removedNotification = notifications.find((notification) => notification.id === notificationId);
        if (!removedNotification) {
            throw new Error(`notification [${notificationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = TransactionEvent.createNotificationRemove({
            transaction: doc.get('id'),
            occurred_at: new Date(),
            notification: removedNotification
        });

        // 永続化
        await transactionAdapter.addEvent(event);
    };
}

/**
 * 匿名所有者更新
 *
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function updateAnonymousOwner(args: {
    transaction_id: string,
    name_first?: string,
    name_last?: string,
    email?: string,
    tel?: string
}): OwnerAndTransactionOperation<void> {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(args.transaction_id).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${args.transaction_id}] not found.`);
        }
        const transaction = <Transaction.ITransaction>doc.toObject();

        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === OwnerGroup.ANONYMOUS);
        });
        if (!anonymousOwner) {
            throw new Error('anonymous owner not found.');
        }

        // 永続化
        debug('updating anonymous owner...');
        const ownerDoc = await ownerAdapter.model.findByIdAndUpdate(
            anonymousOwner.id,
            {
                name_first: args.name_first,
                name_last: args.name_last,
                email: args.email,
                tel: args.tel
            }
        ).exec();
        if (!ownerDoc) {
            throw new Error('owner not found.');
        }
    };
}

/**
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export function enableInquiry(id: string, key: TransactionInquiryKey.ITransactionInquiryKey) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 進行中の取引に照会キー情報を追加
        debug('updating transaction...');
        const doc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: id,
                status: transactionStatus.UNDERWAY
            },
            {
                inquiry_key: key
            },
            { new: true }
        ).exec();

        if (!doc) {
            throw new Error('UNDERWAY transaction not found.');
        }
    };
}

/**
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function close(id: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(id).exec();
        if (!doc) {
            throw new Error(`transaction[${id}] not found.`);
        }

        // 照会可能になっているかどうか
        if (!doc.get('inquiry_key')) {
            throw new Error('inquiry is not available.');
        }

        // 条件が対等かどうかチェック
        // todo 余計なクエリか？
        if (!await transactionAdapter.canBeClosed(doc.get('id'))) {
            throw new Error('transaction cannot be closed.');
        }

        // ステータス変更
        debug('updating transaction...');
        const closedTransactionDoc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: doc.get('id'),
                status: transactionStatus.UNDERWAY
            },
            {
                status: transactionStatus.CLOSED
            },
            { new: true }
        ).exec();

        if (!closedTransactionDoc) {
            throw new Error('UNDERWAY transaction not found.');
        }
    };
}
