/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace service/report
 */

import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as _ from 'underscore';

import GMONotificationAdapter from '../adapter/gmoNotification';
import QueueAdapter from '../adapter/queue';
import TelemetryAdapter from '../adapter/telemetry';
import TransactionAdapter from '../adapter/transaction';

import * as GMOAuthorization from '../factory/authorization/gmo';
import AuthorizationGroup from '../factory/authorizationGroup';
import QueueStatus from '../factory/queueStatus';
import TransactionQueuesStatus from '../factory/transactionQueuesStatus';
import TransactionStatus from '../factory/transactionStatus';

import ArgumentError from '../error/argument';

export type QueueAndTransactionOperation<T> = (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type QueueAndTelemetryAndTransactionOperation<T> =
    (queueAdapter: QueueAdapter, telemetryAdapter: TelemetryAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type GMONotificationOperation<T> = (gmoNotificationAdapter: GMONotificationAdapter) => Promise<T>;

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
 * カード決済GMO通知インターフェース
 * todo そのうち仕様が固まってきたらfactoryに移動
 */
export interface ICreditGMONotification {
    shop_id: string; // ショップID
    access_id: string; // 取引ID
    order_id: string; // オーダーID
    status: string; // 現状態
    job_cd: string; // 処理区分
    amount: string; // 利用金額
    tax: string; // 税送料
    currency: string; // 通貨コード
    forward: string; // 仕向先会社コード
    method: string; // 支払方法
    pay_times: string; // 支払回数
    tran_id: string; // トランザクションID
    approve: string; // 承認番号
    tran_date: string; // 処理日付
    err_code: string; // エラーコード
    err_info: string; // エラー詳細コード
    pay_type: string; // 決済方法
}

/**
 * GMO実売上検索
 * todo webhookで失敗した場合に通知は重複して入ってくる
 * そのケースをどう対処するか
 *
 * @memberof service/report
 */
export function searchGMOSales(dateFrom: Date, dateTo: Date): GMONotificationOperation<ICreditGMONotification[]> {
    return async (gmoNotificationAdapter: GMONotificationAdapter) => {
        // 'tran_date': '20170415230109'の形式
        return <ICreditGMONotification[]>await gmoNotificationAdapter.gmoNotificationModel.find(
            {
                job_cd: GMO.Util.JOB_CD_SALES,
                tran_date: {
                    $gte: moment(dateFrom).format('YYYYMMDDHHmmss'),
                    $lte: moment(dateTo).format('YYYYMMDDHHmmss')
                }
            }
        ).lean().exec();
    };
}

/**
 * GMO実売上を診察にかける
 *
 * @param {ICreditGMONotification} notification GMOクレジットカード通知
 */
export function examineGMOSales(notification: ICreditGMONotification) {
    return async (transactionAdapter: TransactionAdapter) => {
        if (notification.job_cd !== GMO.Util.JOB_CD_SALES) {
            throw new ArgumentError('notification.job_cd', 'job_cd should be SALES');
        }

        if (!_.isEmpty(notification.err_code)) {
            throw new Error(`err_code exists${notification.err_code}`);
        }

        // オーダーIDからCOA予約番号を取得
        // tslint:disable-next-line:no-magic-numbers
        const reserveNum = parseInt(notification.order_id.slice(11, 19), 10);
        debug('reserveNum:', reserveNum);
        if (!Number.isInteger(reserveNum)) {
            throw new Error('invalid orderId');
        }

        const transactionDoc = await transactionAdapter.transactionModel.findOne(
            {
                status: TransactionStatus.CLOSED,
                'inquiry_key.reserve_num': reserveNum
            },
            '_id'
        ).exec();
        debug('transactionDoc:', transactionDoc);

        if (transactionDoc === null) {
            throw new Error('transaction not found');
        }

        const authorizations = await transactionAdapter.findAuthorizationsById(transactionDoc.get('id'));
        const gmoAuthorizationObject = authorizations.find((authorization) => authorization.group === AuthorizationGroup.GMO);

        // GMOオーソリがなければ異常
        if (gmoAuthorizationObject === undefined) {
            throw new Error('gmo authorization not found');
        }
        const gmoAuthorization = GMOAuthorization.create(<any>gmoAuthorizationObject);
        debug('gmoAuthorization:', gmoAuthorization);

        // オーソリのオーダーIDと同一かどうか
        if (gmoAuthorization.gmo_order_id !== notification.order_id) {
            throw new Error('order_id not matched');
        }

        if (gmoAuthorization.gmo_access_id !== notification.access_id) {
            throw new Error('gmo_access_id not matched');
        }

        if (gmoAuthorization.gmo_pay_type !== notification.pay_type) {
            throw new Error('gmo_pay_type not matched');
        }

        // オーソリの金額と同一かどうか
        // tslint:disable-next-line:no-magic-numbers
        if (gmoAuthorization.price !== parseInt(notification.amount, 10)) {
            throw new Error('amount not matched');
        }
    };
}
