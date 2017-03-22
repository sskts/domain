/**
 * キューサービス
 *
 * @namespace StockService
 */
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as util from 'util';

import AssetAdapter from '../adapter/asset';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';

import AuthorizationGroup from '../factory/authorizationGroup';
import NotificationGroup from '../factory/notificationGroup';
import QueueGroup from '../factory/queueGroup';
import QueueStatus from '../factory/queueStatus';

import * as notificationService from './notification';
import * as salesService from './sales';
import * as stockService from './stock';

const debug = createDebug('sskts-domain:service:queue');

/**
 * メール送信キュー実行
 *
 * @export
 */
export function executeSendEmailNotification() {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のメール送信キューを取得
        let queueDoc = await queueAdapter.model.findOneAndUpdate(
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
        ).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return null;
        } else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                await notificationService.sendEmail(queueDoc.get('notification'))();
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { status: QueueStatus.EXECUTED },
                    { new: true }
                ).exec();
            } catch (error) {
                // 実行結果追加
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { $push: { results: error.stack } },
                    { new: true }
                ).exec();
            }

            return <QueueStatus>queueDoc.get('status');
        }
    };
}

/**
 * COA仮予約キャンセルキュー実行
 *
 * @export
 */
export function executeCancelCOASeatReservationAuthorization() {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のCOA仮予約取消キューを取得
        let queueDoc = await queueAdapter.model.findOneAndUpdate(
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
        ).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return null;
        } else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                await stockService.unauthorizeCOASeatReservation(queueDoc.get('authorization'))();
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { status: QueueStatus.EXECUTED },
                    { new: true }
                ).exec();
            } catch (error) {
                // 実行結果追加
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { $push: { results: error.stack } },
                    { new: true }
                ).exec();
            }

            return <QueueStatus>queueDoc.get('status');
        }
    };
}

/**
 * GMO仮売上取消キュー実行
 *
 * @export
 */
export function executeCancelGMOAuthorization() {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のGMOオーソリ取消キューを取得
        let queueDoc = await queueAdapter.model.findOneAndUpdate(
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
        ).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return null;
        } else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                await salesService.cancelGMOAuth(queueDoc.get('authorization'))();
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { status: QueueStatus.EXECUTED },
                    { new: true }
                ).exec();
            } catch (error) {
                // 実行結果追加
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { $push: { results: error.stack } },
                    { new: true }
                ).exec();
            }

            return <QueueStatus>queueDoc.get('status');
        }
    };
}

/**
 * 取引照会無効化キュー実行
 *
 * @export
 */
export function executeDisableTransactionInquiry() {
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {

        let queueDoc = await queueAdapter.model.findOneAndUpdate(
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
        ).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return null;
        } else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                await stockService.disableTransactionInquiry(queueDoc.get('transaction'))(transactionAdapter);
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { status: QueueStatus.EXECUTED },
                    { new: true }
                ).exec();
            } catch (error) {
                // 実行結果追加
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { $push: { results: error.stack } },
                    { new: true }
                ).exec();
            }

            return <QueueStatus>queueDoc.get('status');
        }
    };
}

/**
 * COA本予約キュー実行
 *
 * @export
 */
export function executeSettleCOASeatReservationAuthorization() {
    return async (assetAdapter: AssetAdapter, queueAdapter: QueueAdapter) => {
        // 未実行のCOA資産移動キューを取得
        let queueDoc = await queueAdapter.model.findOneAndUpdate(
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
        ).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return null;
        } else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                await stockService.transferCOASeatReservation(queueDoc.get('authorization'))(assetAdapter);
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { status: QueueStatus.EXECUTED },
                    { new: true }
                ).exec();
            } catch (error) {
                // 実行結果追加
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { $push: { results: error.stack } },
                    { new: true }
                ).exec();
            }

            return <QueueStatus>queueDoc.get('status');
        }
    };
}

/**
 * GMO実売上キュー実行
 *
 * @export
 */
export function executeSettleGMOAuthorization() {
    return async (queueAdapter: QueueAdapter) => {
        // 未実行のGMO実売上キューを取得
        let queueDoc = await queueAdapter.model.findOneAndUpdate(
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
        ).exec();
        debug('queueDoc is', queueDoc);

        if (queueDoc === null) {
            return null;
        } else {
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                await salesService.settleGMOAuth(queueDoc.get('authorization'))();
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { status: QueueStatus.EXECUTED },
                    { new: true }
                ).exec();
            } catch (error) {
                // 実行結果追加
                queueDoc = await queueAdapter.model.findByIdAndUpdate(
                    queueDoc.get('id'),
                    { $push: { results: error.stack } },
                    { new: true }
                ).exec();
            }

            return <QueueStatus>queueDoc.get('status');
        }
    };
}

/**
 * リトライ
 *
 * @export
 * @param {number} intervalInMinutes
 */
export function retry(intervalInMinutes: number) {
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
 * @export
 * @param {number} intervalInMinutes
 */
export function abort(intervalInMinutes: number) {
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
            return null;
        } else {
            // メール通知
            await notificationService.report2developers(
                'キューの実行が中止されました', `
aborted queue:\n
${util.inspect(abortedQueueDoc.toObject(), { showHidden: true, depth: 10 })}\n
`
            )();

            return <string>abortedQueueDoc.get('id');
        }
    };
}
