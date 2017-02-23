/**
 * 取引サービス
 *
 * @namespace TransactionService
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';

import Authorization from '../model/authorization';
import Notification from '../model/notification';
import ObjectId from '../model/objectId';
import Owner from '../model/owner';
import OwnerGroup from '../model/ownerGroup';
import Queue from '../model/queue';
import QueueStatus from '../model/queueStatus';
import Transaction from '../model/transaction';
import TransactionEvent from '../model/transactionEvent';
import TransactionInquiryKey from '../model/transactionInquiryKey';
import TransactionStatus from '../model/transactionStatus';

import OwnerRepository from '../repository/owner';
import QueueRepository from '../repository/queue';
import TransactionRepository from '../repository/transaction';

export type TransactionAndQueueOperation<T> =
    (transactionRepo: TransactionRepository, queueRepo: QueueRepository) => Promise<T>;
export type OwnerAndTransactionOperation<T> =
    (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => Promise<T>;
export type TransactionOperation<T> = (transactionRepo: TransactionRepository) => Promise<T>;

const debug = createDebug('sskts-domain:service:transaction');

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
    return async (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => {
        // 取引取得
        const optionTransaction = await transactionRepo.findById(args.transaction_id);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${args.transaction_id}] not found.`);
        }

        const transaction = optionTransaction.get();

        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === OwnerGroup.ANONYMOUS);
        });
        if (!anonymousOwner) {
            throw new Error('anonymous owner not found.');
        }

        // 永続化
        debug('updating anonymous owner...');
        const option = await ownerRepo.findOneAndUpdate(
            {
                _id: anonymousOwner.id
            },
            {
                $set: {
                    name_first: args.name_first,
                    name_last: args.name_last,
                    email: args.email,
                    tel: args.tel
                }
            }
        );
        if (option.isEmpty) {
            throw new Error('owner not found.');
        }
    };
}

/**
 * IDから取得する
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberOf TransactionService
 */
export function findById(transactionId: string): TransactionOperation<monapt.Option<Transaction>> {
    return async (transactionRepo: TransactionRepository) => await transactionRepo.findById(transactionId);
}

/**
 * 取引開始
 *
 * @param {Date} expiredAt
 * @returns {OwnerAndTransactionOperation<Transaction>}
 *
 * @memberOf TransactionService
 */
export function start(expiredAt: Date) {
    return async (ownerRepo: OwnerRepository, transactionRepo: TransactionRepository) => {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({
            id: ObjectId().toString()
        });

        // 興行主取得
        const option = await ownerRepo.findPromoter();
        if (option.isEmpty) {
            throw new Error('promoter not found.');
        }

        const promoter = option.get();

        // 取引作成
        const transaction = Transaction.create({
            id: ObjectId().toString(),
            status: TransactionStatus.UNDERWAY,
            owners: [promoter, anonymousOwner],
            expired_at: expiredAt
        });

        // 永続化
        debug('storing anonymous owner...', anonymousOwner);
        await ownerRepo.store(anonymousOwner);
        debug('storing transaction...', transaction);
        await transactionRepo.store(transaction);

        return transaction;
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
export function addGMOAuthorization(transactionId: string, authorization: Authorization.GMOAuthorization) {
    return async (transactionRepo: TransactionRepository) => {
        // 取引取得
        const optionTransaction = await transactionRepo.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }

        const transaction = optionTransaction.get();

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
            id: ObjectId().toString(),
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionRepo.addEvent(event);
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
export function addCOASeatReservationAuthorization(transactionId: string, authorization: Authorization.COASeatReservationAuthorization) {
    return async (transactionRepo: TransactionRepository) => {
        // 取引取得
        const optionTransaction = await transactionRepo.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error(`transaction[${transactionId}] not found.`);
        }

        const transaction = optionTransaction.get();

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
            id: ObjectId().toString(),
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionRepo.addEvent(event);
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
    return async (transactionRepo: TransactionRepository) => {
        // 取引取得
        const optionTransacton = await transactionRepo.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }

        const transaction = optionTransacton.get();
        const authorizations = await transactionRepo.findAuthorizationsById(transaction.id);

        const removedAuthorization = authorizations.find((authorization) => authorization.id === authorizationId);
        if (!removedAuthorization) {
            throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = TransactionEvent.createUnauthorize({
            id: ObjectId().toString(),
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: removedAuthorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionRepo.addEvent(event);
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
export function enableInquiry(transactionId: string, key: TransactionInquiryKey) {
    return async (transactionRepo: TransactionRepository) => {
        // 永続化
        const update = {
            $set: {
                inquiry_key: key
            }
        };
        debug('updating transaction...', update);
        const option = await transactionRepo.findOneAndUpdate(
            {
                _id: transactionId,
                status: TransactionStatus.UNDERWAY
            },
            update
        );
        if (option.isEmpty) {
            throw new Error('UNDERWAY transaction not found.');
        }
    };
}

/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function makeInquiry(key: TransactionInquiryKey): TransactionOperation<monapt.Option<Transaction>> {
    debug('finding a transaction...', key);
    return async (transactionRepo: TransactionRepository) => await transactionRepo.findOne({
        inquiry_key: key,
        status: TransactionStatus.CLOSED
    });
}

/**
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function close(transactionId: string) {
    return async (transactionRepo: TransactionRepository) => {
        // 取引取得
        const optionTransaction = await transactionRepo.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error('transaction not found.');
        }

        const transaction = optionTransaction.get();

        // 照会可能になっているかどうか
        if (!transaction.isInquiryAvailable()) {
            throw new Error('inquiry is not available.');
        }

        // 条件が対等かどうかチェック
        if (!await transactionRepo.canBeClosed(transaction.id)) {
            throw new Error('transaction cannot be closed.');
        }

        // 永続化
        const update = {
            $set: {
                status: TransactionStatus.CLOSED
            }
        };
        debug('updating transaction...', update);
        const option = await transactionRepo.findOneAndUpdate(
            {
                _id: transactionId,
                status: TransactionStatus.UNDERWAY
            },
            update
        );
        if (option.isEmpty) {
            throw new Error('UNDERWAY transaction not found.');
        }
    };
}

/**
 * 取引期限切れ
 *
 * @returns {TransactionOperation<void>}
 *
 * @memberOf TransactionService
 */
export function expireOne() {
    return async (transactionRepo: TransactionRepository) => {
        // 永続化
        const update = {
            $set: {
                status: TransactionStatus.EXPIRED
            }
        };
        debug('updating transaction...', update);
        await transactionRepo.findOneAndUpdate(
            {
                status: TransactionStatus.UNDERWAY,
                expired_at: { $lt: new Date() }
            },
            update
        );

        // 永続化結果がemptyの場合は、もう取引中ステータスではないということなので、期限切れタスクとしては成功
    };
}

/**
 * キュー出力
 *
 * @param {string} transactionId
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
export function exportQueues(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (transactionRepo: TransactionRepository, queueRepo: QueueRepository) => {
        const option = await transactionRepo.findById(transactionId);
        if (option.isEmpty) {
            throw new Error('transaction not found.');
        }

        const transaction = option.get();

        const queues: Queue[] = [];
        switch (transaction.status) {
            case TransactionStatus.CLOSED:
                // 取引イベントからキューリストを作成
                (await transactionRepo.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(Queue.createSettleAuthorization({
                        id: ObjectId().toString(),
                        authorization: authorization,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(), // なるはやで実行
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });

                (await transactionRepo.findNotificationsById(transaction.id)).forEach((notification) => {
                    queues.push(Queue.createPushNotification({
                        id: ObjectId().toString(),
                        notification: notification,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(), // todo emailのsent_atを指定
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });

                break;

            // 期限切れの場合は、キューリストを作成する
            case TransactionStatus.EXPIRED:
                (await transactionRepo.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(Queue.createCancelAuthorization({
                        id: ObjectId().toString(),
                        authorization: authorization,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });

                // COA本予約があれば取消
                if (transaction.isInquiryAvailable()) {
                    queues.push(Queue.createDisableTransactionInquiry({
                        id: ObjectId().toString(),
                        transaction: transaction,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }

                // todo おそらく開発時のみ
                queues.push(Queue.createPushNotification(
                    {
                        id: ObjectId().toString(),
                        notification: Notification.createEmail({
                            id: ObjectId().toString(),
                            from: 'noreply@localhost',
                            to: 'hello@motionpicture.jp',
                            subject: 'transaction expired',
                            content: `
取引の期限がきれました
_id: ${transaction.id}
expired_at: ${transaction.expired_at}
`
                        }),
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }
                ));

                break;

            default:
                throw new Error('transaction group not implemented.');
        }
        debug('queues:', queues);

        const promises = queues.map(async (queue) => {
            debug('storing queue...', queue);
            await queueRepo.store(queue);
        });
        await Promise.all(promises);
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
export function addEmail(transactionId: string, notification: Notification.EmailNotification) {
    return async (transactionRepo: TransactionRepository) => {
        // イベント作成
        const event = TransactionEvent.createNotificationAdd({
            id: ObjectId().toString(),
            transaction: transactionId,
            occurred_at: new Date(),
            notification: notification
        });

        // 永続化
        debug('adding an event...', event);
        await transactionRepo.addEvent(event);
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
    return async (transactionRepo: TransactionRepository) => {
        // 取引取得
        const optionTransacton = await transactionRepo.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }

        const transaction = optionTransacton.get();
        const notifications = await transactionRepo.findNotificationsById(transaction.id);

        const removedNotification = notifications.find((notification) => notification.id === notificationId);
        if (!removedNotification) {
            throw new Error(`notification [${notificationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = TransactionEvent.createNotificationRemove({
            id: ObjectId().toString(),
            transaction: transactionId,
            occurred_at: new Date(),
            notification: removedNotification
        });

        // 永続化
        await transactionRepo.addEvent(event);
    };
}
