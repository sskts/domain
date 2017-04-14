/**
 * キューサービス
 * キューの種類ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace QueueService
 */
import * as createDebug from 'debug';
import * as moment from 'moment';

import AssetAdapter from '../adapter/asset';
import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';

import AuthorizationGroup from '../factory/authorizationGroup';
import NotificationGroup from '../factory/notificationGroup';
import QueueGroup from '../factory/queueGroup';
import QueueStatus from '../factory/queueStatus';

import * as notificationService from './notification';
import * as salesService from './sales';
import * as stockService from './stock';

export type AssetAndOwnerAndQueueOperation<T> =
    (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export type QueueOperation<T> = (queueAdapter: QueueAdapter) => Promise<T>;
export type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:queue');

/**
 * キュー実行時のソート条件
 */
const sortOrder4executionOfQueues = {
    count_tried: 1, // 試行回数の少なさ優先
    run_at: 1 // 実行予定日時の早さ優先
};

/**
 * メール送信キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export function executeSendEmailNotification(): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のメール送信キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.PUSH_NOTIFICATION,
                'notification.group': NotificationGroup.EMAIL
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await notificationService.sendEmail(queueDoc.get('notification'))();
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * COA仮予約キャンセルキュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export function executeCancelCOASeatReservationAuthorization(): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のCOA仮予約取消キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.COA_SEAT_RESERVATION
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await stockService.unauthorizeCOASeatReservation(queueDoc.get('authorization'))();
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * GMO仮売上取消キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export function executeCancelGMOAuthorization(): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のGMOオーソリ取消キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.GMO
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await salesService.cancelGMOAuth(queueDoc.get('authorization'))();
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * ムビチケ着券取消キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export function executeCancelMvtkAuthorization(): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のムビチケ着券取消キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.MVTK
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await salesService.cancelMvtkAuthorization(queueDoc.get('authorization'))();
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * 取引照会無効化キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueAndTransactionOperation<void>}
 */
export function executeDisableTransactionInquiry(): QueueAndTransactionOperation<void> {
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.DISABLE_TRANSACTION_INQUIRY
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await stockService.disableTransactionInquiry(queueDoc.get('transaction'))(transactionAdapter);
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * COA本予約キュー実行
 *
 * @memberOf QueueService
 * @returns {AssetAndQueueOperation<void>}
 */
export function executeSettleCOASeatReservationAuthorization(): AssetAndOwnerAndQueueOperation<void> {
    return async (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, queueAdapter: QueueAdapter) => {
        // 未実行のCOA資産移動キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.COA_SEAT_RESERVATION
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await stockService.transferCOASeatReservation(queueDoc.get('authorization'))(assetAdapter, ownerAdapter);
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * GMO実売上キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export function executeSettleGMOAuthorization(): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のGMO実売上キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.GMO
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await salesService.settleGMOAuth(queueDoc.get('authorization'))();
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * ムビチケ資産移動キュー実行
 *
 * @memberOf QueueService
 * @returns {QueueOperation<void>}
 */
export function executeSettleMvtkAuthorization(): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のムビチケ資産移動キューを取得
        const queueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.UNEXECUTED,
                run_at: { $lt: new Date() },
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.MVTK
            },
            {
                status: QueueStatus.RUNNING, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { count_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfQueues).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return;
        }

        try {
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            await salesService.settleMvtkAuthorization(queueDoc.get('authorization'))();
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { status: QueueStatus.EXECUTED },
                { new: true }
            ).exec();
        } catch (error) {
            // 実行結果追加
            await queueAdapter.model.findByIdAndUpdate(
                queueDoc.get('id'),
                { $push: { results: error.stack } },
                { new: true }
            ).exec();
        }
    };
}

/**
 * リトライ
 *
 * @memberOf QueueService
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューをリトライするか
 * @returns {QueueOperation<void>}
 */
export function retry(intervalInMinutes: number): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        await queueAdapter.model.update(
            {
                status: QueueStatus.RUNNING,
                last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }, // tslint:disable-line:no-magic-numbers
                // tslint:disable-next-line:no-invalid-this space-before-function-paren
                $where: function (this: any) { return (this.max_count_try > this.count_tried); }
            },
            {
                status: QueueStatus.UNEXECUTED // 実行中に変更
            },
            { multi: true }
        ).exec();
    };
}

/**
 * 実行中止
 *
 * @memberOf QueueService
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューを中止するか
 * @returns {QueueOperation<void>}
 */
export function abort(intervalInMinutes: number): QueueOperation<void> {
    return async (queueAdapter: QueueAdapter) => {
        const abortedQueueDoc = await queueAdapter.model.findOneAndUpdate(
            {
                status: QueueStatus.RUNNING,
                last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }, // tslint:disable-line:no-magic-numbers
                // tslint:disable-next-line:no-invalid-this space-before-function-paren
                $where: function (this: any) { return (this.max_count_try === this.count_tried); }
            },
            {
                status: QueueStatus.ABORTED
            },
            { new: true }
        ).exec();
        debug('abortedQueueDoc:', abortedQueueDoc);

        if (abortedQueueDoc === null) {
            return;
        }

        // メール通知
        const results = <string[]>abortedQueueDoc.get('results');
        const authorization = abortedQueueDoc.get('authorization');
        const notification = abortedQueueDoc.get('notification');
        await notificationService.report2developers(
            'キューの実行が中止されました',
            `id:${abortedQueueDoc.get('_id')}
group:${abortedQueueDoc.get('group')}
authorization:${(authorization !== undefined) ? authorization.group : ''}
notification:${(notification !== undefined) ? notification.group : ''}
run_at:${moment(abortedQueueDoc.get('run_at')).toISOString()}
last_tried_at:${moment(abortedQueueDoc.get('last_tried_at')).toISOString()}
最終結果:${results[results.length - 1]}`
        )();
    };
}
