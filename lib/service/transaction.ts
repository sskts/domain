/**
 * 取引サービス
 *
 * @namespace TransactionService
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';
import * as util from 'util';

import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as Owner from '../factory/owner';
import OwnerGroup from '../factory/ownerGroup';
import * as Queue from '../factory/queue';
import QueueStatus from '../factory/queueStatus';
import * as Transaction from '../factory/transaction';
import * as TransactionEvent from '../factory/transactionEvent';
import * as TransactionInquiryKey from '../factory/transactionInquiryKey';
import TransactionStatus from '../factory/transactionStatus';

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
 * 開始準備のできた取引を用意する
 *
 * @export
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 * @returns
 */
export function prepare(length: number, expiresInSeconds: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引をlengthコ作成
        const expiresAt = moment().add(expiresInSeconds, 'seconds').toDate();
        const transactions = Array.from(Array(length).keys()).map(() => {
            return Transaction.create({
                status: TransactionStatus.READY,
                owners: [],
                expires_at: expiresAt
            });
        });

        // 永続化
        debug('creating transactions...', transactions);
        await transactionAdapter.create(transactions);
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
        const optionTransaction = await transactionAdapter.findById(args.transaction_id);
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
        const option = await ownerAdapter.findOneAndUpdate(
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
export function findById(transactionId: string): TransactionOperation<monapt.Option<Transaction.ITransaction>> {
    return async (transactionAdapter: TransactionAdapter) => await transactionAdapter.findById(transactionId);
}

/**
 * 取引開始
 *
 * @param {Date} expiresAt
 * @returns {OwnerAndTransactionOperation<Transaction>}
 *
 * @memberOf TransactionService
 */
export function start(expiresAt: Date) {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({});

        // 興行主取得
        const option = await ownerAdapter.findPromoter();
        if (option.isEmpty) {
            throw new Error('promoter not found');
        }

        const promoter = option.get();

        // 所有者永続化
        debug('storing anonymous owner...', anonymousOwner);
        await ownerAdapter.store(anonymousOwner);

        // 取引永続化
        const update = {
            $set: {
                status: TransactionStatus.UNDERWAY,
                owners: [promoter.id, anonymousOwner.id],
                expires_at: expiresAt
            }
        };
        debug('updating transaction...', update);
        const transactionOption = await transactionAdapter.findOneAndUpdate(
            {
                status: TransactionStatus.READY
            },
            update
        );

        if (transactionOption.isDefined) {
            const transaction = <Transaction.ITransaction>transactionOption.get();
            transaction.owners = [promoter, anonymousOwner];
            return monapt.Option(transaction);
        } else {
            return monapt.None;
        }
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
        const optionTransaction = await transactionAdapter.findById(transactionId);
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
        const optionTransaction = await transactionAdapter.findById(transactionId);
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
        const optionTransacton = await transactionAdapter.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }

        const transaction = optionTransacton.get();
        const authorizations = await transactionAdapter.findAuthorizationsById(transaction.id);

        const removedAuthorization = authorizations.find((authorization) => authorization.id === authorizationId);
        if (!removedAuthorization) {
            throw new Error(`authorization [${authorizationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = TransactionEvent.createUnauthorize({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: removedAuthorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
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
export function enableInquiry(transactionId: string, key: TransactionInquiryKey.ITransactionInquiryKey) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 永続化
        const update = {
            $set: {
                inquiry_key: key
            }
        };
        debug('updating transaction...', update);
        const option = await transactionAdapter.findOneAndUpdate(
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
export function makeInquiry(key: TransactionInquiryKey.ITransactionInquiryKey) {
    debug('finding a transaction...', key);
    return async (transactionAdapter: TransactionAdapter) => await transactionAdapter.findOne({
        'inquiry_key.theater_code': key.theater_code,
        'inquiry_key.reserve_num': key.reserve_num,
        'inquiry_key.tel': key.tel,
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
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const optionTransaction = await transactionAdapter.findById(transactionId);
        if (optionTransaction.isEmpty) {
            throw new Error('transaction not found.');
        }

        const transaction = optionTransaction.get();

        // 照会可能になっているかどうか
        if (!transaction.inquiry_key) {
            throw new Error('inquiry is not available.');
        }

        // 条件が対等かどうかチェック
        if (!await transactionAdapter.canBeClosed(transaction.id)) {
            throw new Error('transaction cannot be closed.');
        }

        // 永続化
        const update = {
            $set: {
                status: TransactionStatus.CLOSED
            }
        };
        debug('updating transaction...', update);
        const option = await transactionAdapter.findOneAndUpdate(
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
    return async (transactionAdapter: TransactionAdapter) => {
        // 永続化
        const update = {
            $set: {
                status: TransactionStatus.EXPIRED
            }
        };
        debug('updating transaction...', update);
        await transactionAdapter.findOneAndUpdate(
            {
                status: TransactionStatus.UNDERWAY,
                expires_at: { $lt: new Date() }
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
    return async (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => {
        const option = await transactionAdapter.findById(transactionId);
        if (option.isEmpty) {
            throw new Error('transaction not found.');
        }

        const transaction = option.get();

        const queues: Queue.IQueue[] = [];
        switch (transaction.status) {
            case TransactionStatus.CLOSED:
                // 取引イベントからキューリストを作成
                (await transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(Queue.createSettleAuthorization({
                        authorization: authorization,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(), // なるはやで実行
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                });

                (await transactionAdapter.findNotificationsById(transaction.id)).forEach((notification) => {
                    queues.push(Queue.createPushNotification({
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
                (await transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(Queue.createCancelAuthorization({
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
                if (transaction.inquiry_key) {
                    queues.push(Queue.createDisableTransactionInquiry({
                        transaction: transaction,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }

                // 開発時のみ通知
                if (process.env.NODE_ENV !== 'production') {
                    queues.push(Queue.createPushNotification(
                        {
                            notification: Notification.createEmail({
                                from: 'noreply@localhost',
                                to: 'hello@motionpicture.jp',
                                subject: 'transaction has expired',
                                content: `
transaction:\n
${util.inspect(transaction, { showHidden: true, depth: 10 })}\n
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
                }

                break;

            default:
                throw new Error('transaction group not implemented.');
        }
        debug('queues:', queues);

        const promises = queues.map(async (queue) => {
            debug('storing queue...', queue);
            await queueAdapter.store(queue);
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
        const optionTransacton = await transactionAdapter.findById(transactionId);
        if (optionTransacton.isEmpty) {
            throw new Error('tranasction not found.');
        }

        const transaction = optionTransacton.get();
        const notifications = await transactionAdapter.findNotificationsById(transaction.id);

        const removedNotification = notifications.find((notification) => notification.id === notificationId);
        if (!removedNotification) {
            throw new Error(`notification [${notificationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = TransactionEvent.createNotificationRemove({
            transaction: transactionId,
            occurred_at: new Date(),
            notification: removedNotification
        });

        // 永続化
        await transactionAdapter.addEvent(event);
    };
}
