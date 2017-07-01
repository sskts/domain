/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/taskFunctions
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import TransactionAdapter from '../adapter/transaction';

import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';

import * as CancelGMOAuthorizationTaskFactory from '../factory/task/cancelGMOAuthorization';
import * as CancelMvtkAuthorizationTaskFactory from '../factory/task/cancelMvtkAuthorization';
import * as CancelSeatReservationAuthorizationTaskFactory from '../factory/task/cancelSeatReservationAuthorization';
import * as DisableTransactionInquiryTaskFactory from '../factory/task/disableTransactionInquiry';
import * as SendEmailNotificationTaskFactory from '../factory/task/sendEmailNotification';
import * as SettleGMOAuthorizationTaskFactory from '../factory/task/settleGMOAuthorization';
import * as SettleMvtkAuthorizationTaskFactory from '../factory/task/settleMvtkAuthorization';
import * as SettleSeatReservationAuthorizationTaskFactory from '../factory/task/settleSeatReservationAuthorization';

import * as NotificationService from '../service/notification';
import * as SalesService from '../service/sales';
import * as StockService from '../service/stock';

const debug = createDebug('sskts-domain:service:taskFunctions');

export type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;

export function sendEmailNotification(
    data: SendEmailNotificationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        await NotificationService.sendEmail(data.notification)();
    };
}

export function cancelSeatReservationAuthorization(
    data: CancelSeatReservationAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);

        // 座席予約承認を取り出す
        const transactionAdapter = new TransactionAdapter(connection);
        const authorizations = await transactionAdapter.findAuthorizationsById(data.transaction);
        const seatReservationAuthorization = <COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization>authorizations.find(
            (authorization) => authorization.id === data.authorization
        );
        await StockService.unauthorizeCOASeatReservation(seatReservationAuthorization)();
    };
}

export function cancelGMOAuthorization(
    data: CancelGMOAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);

        // 座席予約承認を取り出す
        const transactionAdapter = new TransactionAdapter(connection);
        const authorizations = await transactionAdapter.findAuthorizationsById(data.transaction);
        const gmoAuthorization = <GMOAuthorizationFactory.IGMOAuthorization>authorizations.find(
            (authorization) => authorization.id === data.authorization
        );
        await SalesService.cancelGMOAuth(gmoAuthorization)();
    };
}

export function cancelMvtkAuthorization(
    data: CancelMvtkAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        // await salesService.cancelMvtkAuthorization(queueDoc.get('authorization'))();
    };
}

export function disableTransactionInquiry(
    data: DisableTransactionInquiryTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        // await stockService.disableTransactionInquiry(queueDoc.get('transaction'))(transactionAdapter);
    };
}

export function settleSeatReservationAuthorization(
    data: SettleSeatReservationAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        // await stockService.transferCOASeatReservation(queueDoc.get('authorization'))(
        //     assetAdapter, ownerAdapter, performanceAdapter
        // );
    };
}

export function settleGMOAuthorization(
    data: SettleGMOAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        // await salesService.settleGMOAuth(queueDoc.get('authorization'))();
    };
}

export function settleMvtkAuthorization(
    data: SettleMvtkAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        // await salesService.settleMvtkAuthorization(queueDoc.get('authorization'))();
    };
}
