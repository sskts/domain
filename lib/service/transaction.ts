/**
 * 取引サービス
 * 取引一般に対する処理はここで定義する
 * 特定の取引(ID指定)に対する処理はtransactionWithIdサービスで定義
 *
 * @namespace service/transaction
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

import * as AnonymousOwnerFactory from '../factory/owner/anonymous';
import * as PromoterOwnerFactory from '../factory/owner/promoter';
import OwnerGroup from '../factory/ownerGroup';
import * as QueueFactory from '../factory/queue';
import * as CancelAuthorizationQueueFactory from '../factory/queue/cancelAuthorization';
import * as DisableTransactionInquiryQueueFactory from '../factory/queue/disableTransactionInquiry';
import * as PushNotificationQueueFactory from '../factory/queue/pushNotification';
import * as SettleAuthorizationQueueFactory from '../factory/queue/settleAuthorization';
import QueueStatus from '../factory/queueStatus';
import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import TransactionQueuesStatus from '../factory/transactionQueuesStatus';
import * as TransactionScopeFactory from '../factory/transactionScope';
import TransactionStatus from '../factory/transactionStatus';

import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';
import TransactionCountAdapter from '../adapter/transactionCount';

export type TransactionAndQueueOperation<T> =
    (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export type OwnerAndTransactionAndTransactionCountOperation<T> =
    (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<T>;
export type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:transaction');

/**
 * 開始準備のできた取引を用意する
 *
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 * @memberof service/transaction
 */
export function prepare(length: number, expiresInSeconds: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引を{length}コ作成
        const expiresAt = moment().add(expiresInSeconds, 'seconds').toDate();
        const transactions = Array.from(Array(length).keys()).map(() => {
            const transaction = TransactionFactory.create({
                status: TransactionStatus.READY,
                owners: [],
                expires_at: expiresAt
            });
            (<any>transaction)._id = transaction.id;

            return transaction;
        });

        // 永続化
        debug('creating transactions...', transactions);
        await transactionAdapter.transactionModel.create(transactions);
    };
}

/**
 * 匿名所有者として取引開始する
 *
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.unitOfCountInSeconds 取引数制限単位期間
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 *
 * @memberof service/transaction
 */
export function startAsAnonymous(args: {
    expiresAt: Date;
    maxCountPerUnit: number;
    state: string;
    scope: TransactionScopeFactory.ITransactionScope;
}): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>> {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => {
        // todo スコープのready_fromが未来であればはじく？

        // 利用可能かどうか
        const nextCount = await transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }

        // 利用可能であれば、取引作成&匿名所有者作成
        // 一般所有者作成(後で取引の所有者が適切かどうかを確認するために、状態を持たせる)
        const anonymousOwner = AnonymousOwnerFactory.create({
            state: args.state
        });

        // 興行主取得
        const promoterOwnerDoc = await ownerAdapter.model.findOne({ group: OwnerGroup.PROMOTER }).exec();
        if (promoterOwnerDoc === null) {
            throw new Error('promoter not found');
        }
        const promoter = <PromoterOwnerFactory.IPromoterOwner>promoterOwnerDoc.toObject();

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const newTransaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [promoter, anonymousOwner],
            expires_at: args.expiresAt,
            started_at: moment().toDate()
        });

        // 所有者永続化
        // createコマンドで作成すること(ありえないはずだが、万が一所有者IDが重複するようなバグがあっても、ユニークインデックスではじかれる)
        debug('creating anonymous owner...', anonymousOwner);
        const anonymousOwnerDoc = { ...anonymousOwner, ...{ _id: anonymousOwner.id } };
        await ownerAdapter.model.create(anonymousOwnerDoc);

        debug('creating transaction...');
        // mongoDBに追加するために_idとowners属性を拡張
        const newTransactionDoc = { ...newTransaction, ...{ _id: newTransaction.id, owners: [promoter.id, anonymousOwner.id] } };
        await transactionAdapter.transactionModel.create(newTransactionDoc);

        return monapt.Option(newTransaction);
    };
}

/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction
 */
export function makeInquiry(key: TransactionInquiryKeyFactory.ITransactionInquiryKey) {
    debug('finding a transaction...', key);

    return async (transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findOne({
            'inquiry_key.theater_code': key.theater_code,
            'inquiry_key.reserve_num': key.reserve_num,
            'inquiry_key.tel': key.tel,
            status: TransactionStatus.CLOSED
        }).populate('owners').exec();

        return (doc === null) ? monapt.None : monapt.Option(<TransactionFactory.ITransaction>doc.toObject());
    };
}

/**
 * 不要な取引を削除する
 * @memberof service/transaction
 */
export function clean() {
    return async (transactionAdapter: TransactionAdapter) => {
        // 開始準備ステータスのまま期限切れの取引を削除する
        await transactionAdapter.transactionModel.remove(
            {
                status: TransactionStatus.READY,
                expires_at: { $lt: new Date() }
            }
        ).exec();
    };
}

/**
 * 取引を期限切れにする
 * @memberof service/transaction
 */
export function makeExpired() {
    return async (transactionAdapter: TransactionAdapter) => {
        const expiredAt = moment().toDate();

        // ステータスと期限を見て更新
        await transactionAdapter.transactionModel.update(
            {
                status: TransactionStatus.UNDERWAY,
                expires_at: { $lt: expiredAt }
            },
            {
                status: TransactionStatus.EXPIRED,
                expired_at: expiredAt
            },
            { multi: true }
        ).exec();
    };
}

/**
 * ひとつの取引のキューをエクスポートする
 *
 * @param {TransactionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
export function exportQueues(status: TransactionStatus) {
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        const statusesQueueExportable = [TransactionStatus.EXPIRED, TransactionStatus.CLOSED];
        if (statusesQueueExportable.indexOf(status) < 0) {
            throw new ArgumentError('status', `transaction status should be in [${statusesQueueExportable.join(',')}]`);
        }

        let transactionDoc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                status: status,
                queues_status: TransactionQueuesStatus.UNEXPORTED
            },
            { queues_status: TransactionQueuesStatus.EXPORTING },
            { new: true }
        ).exec();

        if (transactionDoc === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        await exportQueuesById(transactionDoc.get('id'))(
            queueAdapter,
            transactionAdapter
        );

        transactionDoc = await transactionAdapter.transactionModel.findByIdAndUpdate(
            transactionDoc.get('id'),
            {
                queues_status: TransactionQueuesStatus.EXPORTED,
                queues_exported_at: moment().toDate()
            },
            { new: true }
        ).exec();
    };
}

/**
 * ID指定で取引のキュー出力
 *
 * @param {string} id
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberof service/transaction
 */
export function exportQueuesById(id: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        if (doc === null) {
            throw new Error(`transaction[${id}] not found.`);
        }
        const transaction = <TransactionFactory.ITransaction>doc.toObject();

        const queues: QueueFactory.IQueue[] = [];
        switch (transaction.status) {
            case TransactionStatus.CLOSED:
                // 取引イベントからキューリストを作成
                (await transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    queues.push(SettleAuthorizationQueueFactory.create({
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
                    queues.push(PushNotificationQueueFactory.create({
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
                    queues.push(CancelAuthorizationQueueFactory.create({
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
                if (!_.isEmpty(transaction.inquiry_key)) {
                    queues.push(DisableTransactionInquiryQueueFactory.create({
                        transaction: transaction,
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: []
                    }));
                }

                break;

            default:
                throw new ArgumentError('id', 'transaction group not implemented.');
        }
        debug('queues:', queues);

        const promises = queues.map(async (queue) => {
            debug('storing queue...', queue);
            await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        });
        await Promise.all(promises);
    };
}

/**
 * キューエクスポートリトライ
 * todo updated_atを基準にしているが、キューエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export function reexportQueues(intervalInMinutes: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                queues_status: TransactionQueuesStatus.EXPORTING,
                updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() } // tslint:disable-line:no-magic-numbers
            },
            {
                queues_status: TransactionQueuesStatus.UNEXPORTED
            }
        ).exec();
    };
}
