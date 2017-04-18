/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace service/report
 */

import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as moment from 'moment';

import GMONotificationAdapter from '../adapter/gmoNotification';
import QueueAdapter from '../adapter/queue';
import TelemetryAdapter from '../adapter/telemetry';
import TransactionAdapter from '../adapter/transaction';

import QueueStatus from '../factory/queueStatus';
import TransactionQueuesStatus from '../factory/transactionQueuesStatus';
import TransactionStatus from '../factory/transactionStatus';

export type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type QueueAndTelemetryAndTransactionOperation<T> =
    (queueAdapter: QueueAdapter, telemetryAdapter: TelemetryAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:report');
const TELEMETRY_UNIT_TIME_IN_SECONDS = 60; // 測定単位時間(秒)

export interface IReportTransactionStatuses {
    numberOfTransactionsReady: number;
    numberOfTransactionsUnderway: number;
    numberOfTransactionsClosedWithQueuesUnexported: number;
    numberOfTransactionsExpiredWithQueuesUnexported: number;
    numberOfQueuesUnexecuted: number;
}

/**
 * 測定データを作成する
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
export function createTelemetry(): QueueAndTelemetryAndTransactionOperation<void> {
    return async (queueAdapter: QueueAdapter, telemetryAdapter: TelemetryAdapter, transactionAdapter: TransactionAdapter) => {
        const dateNow = moment();
        const dateNowByUnitTime = moment.unix((dateNow.unix() - (dateNow.unix() % TELEMETRY_UNIT_TIME_IN_SECONDS)));

        debug('counting ready transactions...');
        const numberOfTransactionsReady = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.READY,
            expires_at: { $gt: moment().toDate() }
        }).exec();

        debug('counting underway transactions...');
        const numberOfTransactionsUnderway = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.UNDERWAY
        }).exec();

        const numberOfTransactionsClosedWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.CLOSED,
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfTransactionsExpiredWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.EXPIRED,
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfQueuesUnexecuted = await queueAdapter.model.count({
            status: QueueStatus.UNEXECUTED
        }).exec();

        await telemetryAdapter.telemetryModel.create(
            {
                transactions: {
                    numberOfReady: numberOfTransactionsReady,
                    numberOfUnderway: numberOfTransactionsUnderway,
                    numberOfClosedWithQueuesUnexported: numberOfTransactionsClosedWithQueuesUnexported,
                    numberOfExpiredWithQueuesUnexported: numberOfTransactionsExpiredWithQueuesUnexported
                },
                queues: {
                    numberOfUnexecuted: numberOfQueuesUnexecuted
                },
                executed_at: dateNowByUnitTime.toDate()
            }
        );
    };
}

/**
 *
 * @returns {QueueAndTransactionOperation<IReportTransactionStatuses>}
 * @memberof service/report
 */
export function transactionStatuses(): QueueAndTransactionOperation<IReportTransactionStatuses> {
    return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
        debug('counting ready transactions...');
        const numberOfTransactionsReady = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.READY,
            expires_at: { $gt: moment().toDate() }
        }).exec();

        debug('counting underway transactions...');
        const numberOfTransactionsUnderway = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.UNDERWAY
        }).exec();

        const numberOfTransactionsClosedWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.CLOSED,
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfTransactionsExpiredWithQueuesUnexported = await transactionAdapter.transactionModel.count({
            status: TransactionStatus.EXPIRED,
            queues_status: TransactionQueuesStatus.UNEXPORTED
        }).exec();

        const numberOfQueuesUnexecuted = await queueAdapter.model.count({
            status: QueueStatus.UNEXECUTED
        }).exec();

        return {
            numberOfTransactionsReady: numberOfTransactionsReady,
            numberOfTransactionsUnderway: numberOfTransactionsUnderway,
            numberOfTransactionsClosedWithQueuesUnexported: numberOfTransactionsClosedWithQueuesUnexported,
            numberOfTransactionsExpiredWithQueuesUnexported: numberOfTransactionsExpiredWithQueuesUnexported,
            numberOfQueuesUnexecuted: numberOfQueuesUnexecuted
        };
    };
}

/**
 * GMO実売上検索
 * @memberof service/report
 */
export function searchGMOSales(dateFrom: Date, dateTo: Date) {
    return async (gmoNotificationAdapter: GMONotificationAdapter) => {
        // "tran_date": "20170415230109"の形式
        const notificationDocs = await gmoNotificationAdapter.gmoNotificationModel.find(
            {
                job_cd: GMO.Util.JOB_CD_SALES,
                tran_date: {
                    $gte: moment(dateFrom).format('YYYYMMDDHHmmss'),
                    $lte: moment(dateTo).format('YYYYMMDDHHmmss')
                }
            }
        ).exec();

        return notificationDocs.map((notificationDoc) => {
            return {
                shop_id: <string>notificationDoc.get('shop_id'),
                order_id: <string>notificationDoc.get('order_id'),
                // tslint:disable-next-line:no-magic-numbers
                amount: parseInt(notificationDoc.get('amount'), 10),
                tran_date: <string>notificationDoc.get('tran_date')
            };
        });
    };
}
