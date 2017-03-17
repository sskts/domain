/**
 * 取引サービス
 * 取引一般に対する処理はここで定義する
 * 特定の取引(ID指定)に対する処理はtransactionWithIdサービスで定義
 *
 * @namespace TransactionService
 */
import * as clone from 'clone';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import * as Owner from '../factory/owner';
import OwnerGroup from '../factory/ownerGroup';
import * as Queue from '../factory/queue';
import QueueStatus from '../factory/queueStatus';
import * as Transaction from '../factory/transaction';
import * as TransactionInquiryKey from '../factory/transactionInquiryKey';
import transactionQueuesStatus from '../factory/transactionQueuesStatus';
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
 * 開始準備のできた取引を用意する
 *
 * @export
 * @param {number} length 取引数
 * @param {number} expiresInSeconds 現在から何秒後に期限切れにするか
 */
export function prepare(length: number, expiresInSeconds: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引を{length}コ作成
        const expiresAt = moment().add(expiresInSeconds, 'seconds').toDate();
        const transactions = Array.from(Array(length).keys()).map(() => {
            const transaction = Transaction.create({
                status: transactionStatus.READY,
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
 * 取引を強制的に開始する
 *
 * @export
 * @param {Date} expiresAt
 */
export function startForcibly(expiresAt: Date) {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({});

        // 興行主取得
        const ownerDoc = await ownerAdapter.model.findOne({ group: OwnerGroup.PROMOTER }).exec();
        if (!ownerDoc) {
            throw new Error('promoter not found');
        }
        const promoter = <Owner.IPromoterOwner>ownerDoc.toObject();

        const transaction = Transaction.create({
            status: transactionStatus.UNDERWAY,
            owners: [promoter, anonymousOwner],
            expires_at: expiresAt
        });

        // 所有者永続化
        debug('storing anonymous owner...', anonymousOwner);
        await ownerAdapter.model.findByIdAndUpdate(anonymousOwner.id, anonymousOwner, { new: true, upsert: true }).exec();

        // ステータスを変更&しつつ、期限も延長する
        debug('updating transaction...');
        const update = Object.assign(clone(transaction), { owners: [promoter.id, anonymousOwner.id] });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, update, { new: true, upsert: true });

        return transaction;
    };
}

/**
 * 可能であれば取引開始する
 *
 * @param {Date} expiresAt
 * @returns {OwnerAndTransactionOperation<Promise<monapt.Option<Transaction.ITransaction>>>}
 *
 * @memberOf TransactionService
 */
export function startIfPossible(expiresAt: Date) {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 一般所有者作成
        const anonymousOwner = Owner.createAnonymous({});

        // 興行主取得
        const ownerDoc = await ownerAdapter.model.findOne({ group: OwnerGroup.PROMOTER }).exec();
        if (!ownerDoc) {
            throw new Error('promoter not found');
        }
        const promoter = <Owner.IPromoterOwner>ownerDoc.toObject();

        // 所有者永続化
        debug('storing anonymous owner...', anonymousOwner);
        await ownerAdapter.model.findByIdAndUpdate(anonymousOwner.id, anonymousOwner, { new: true, upsert: true }).exec();

        // ステータスを変更&しつつ、期限も延長する
        debug('updating transaction...');
        const transactionDoc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                status: transactionStatus.READY
            },
            {
                status: transactionStatus.UNDERWAY,
                owners: [promoter.id, anonymousOwner.id],
                expires_at: expiresAt
            },
            {
                new: true,
                upsert: false
            }
        ).exec();

        if (transactionDoc) {
            const transaction = <Transaction.ITransaction>transactionDoc.toObject();
            transaction.owners = [promoter, anonymousOwner];
            return monapt.Option(transaction);
        } else {
            return monapt.None;
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
    return async (transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findOne({
            'inquiry_key.theater_code': key.theater_code,
            'inquiry_key.reserve_num': key.reserve_num,
            'inquiry_key.tel': key.tel,
            status: transactionStatus.CLOSED
        }).populate('owners').exec();

        return (doc) ? monapt.Option(<Transaction.ITransaction>doc.toObject()) : monapt.None;
    };
}

/**
 * 不要な取引を削除する
 */
export function clean() {
    return async (transactionAdapter: TransactionAdapter) => {
        // 開始準備ステータスのまま期限切れの取引を削除する
        await transactionAdapter.transactionModel.remove(
            {
                status: transactionStatus.READY,
                expires_at: { $lt: new Date() }
            }
        ).exec();
    };
}

/**
 * 取引を期限切れにする
 */
export function makeExpired() {
    return async (transactionAdapter: TransactionAdapter) => {
        // ステータスと期限を見て更新
        await transactionAdapter.transactionModel.update(
            {
                status: transactionStatus.UNDERWAY,
                expires_at: { $lt: new Date() }
            },
            {
                status: transactionStatus.EXPIRED
            },
            { multi: true }
        ).exec();
    };
}

/**
 * ひとつの取引のキューをエクスポートする
 *
 * @param {transactionStatus} statu 取引ステータス
 */
export function exportQueues(status: transactionStatus) {
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        const statusesQueueExportable = [transactionStatus.EXPIRED, transactionStatus.CLOSED];
        if (statusesQueueExportable.indexOf(status) < 0) {
            throw new RangeError(`transaction status should be in [${statusesQueueExportable.join(',')}]`);
        }

        let transactionDoc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                status: status,
                queues_status: transactionQueuesStatus.UNEXPORTED
            },
            { queues_status: transactionQueuesStatus.EXPORTING },
            { new: true }
        ).exec();

        if (transactionDoc) {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await exportQueuesById(transactionDoc.get('id'))(
                queueAdapter,
                transactionAdapter
            );

            transactionDoc = await transactionAdapter.transactionModel.findByIdAndUpdate(
                transactionDoc.get('id'),
                { queues_status: transactionQueuesStatus.EXPORTED },
                { new: true }
            ).exec();
        }

        return (transactionDoc) ? <transactionQueuesStatus>transactionDoc.get('queues_status') : null;
    };
}

/**
 * キュー出力
 * todo TransactionWithIdに移行するべき？
 *
 * @param {string} id
 * @returns {TransactionAndQueueOperation<void>}
 *
 * @memberOf TransactionService
 */
export function exportQueuesById(id: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        if (!doc) {
            throw new Error(`transaction[${id}] not found.`);
        }
        const transaction = <Transaction.ITransaction>doc.toObject();

        const queues: Queue.IQueue[] = [];
        switch (transaction.status) {
            case transactionStatus.CLOSED:
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
            case transactionStatus.EXPIRED:
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

                // 開発時のみ通知(メール送信数が増えすぎるので中止)
                //                 if (process.env.NODE_ENV === 'development') {
                //                     await notificationService.report2developers(
                //                         '取引の期限が切れました', `
                // transaction:\n
                // ${util.inspect(transaction, { showHidden: true, depth: 10 })}\n
                // `
                //                     )();
                //                 }

                break;

            default:
                throw new Error('transaction group not implemented.');
        }
        debug('queues:', queues);

        const promises = queues.map(async (queue) => {
            debug('storing queue...', queue);
            await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        });
        await Promise.all(promises);

        return queues.map((queue) => queue.id);
    };
}

/**
 * キューエクスポートリトライ
 * todo updated_atを基準にしているが、キューエクスポートトライ日時を持たせた方が安全か？
 *
 * @export
 * @param {number} intervalInMinutes
 */
export function reexportQueues(intervalInMinutes: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                queues_status: transactionQueuesStatus.EXPORTING,
                updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() } // tslint:disable-line:no-magic-numbers
            },
            {
                queues_status: transactionQueuesStatus.UNEXPORTED
            }
        ).exec();
    };
}
