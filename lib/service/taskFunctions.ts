/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/taskFunctions
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';

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

    return async (__: mongoose.Connection) => {
        await StockService.unauthorizeCOASeatReservation(data.authorization)();
    };
}

export function cancelGMOAuthorization(
    data: CancelGMOAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.cancelGMOAuth(data.authorization)();
    };
}

export function cancelMvtkAuthorization(
    data: CancelMvtkAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.cancelMvtkAuthorization(data.authorization)();
    };
}

export function disableTransactionInquiry(
    data: DisableTransactionInquiryTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        // 照会キーを登録する前にCOA本予約を実行する必要がなくなったので、この処理は不要
    };
}

export function settleSeatReservationAuthorization(
    data: SettleSeatReservationAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        const ownershipInfoAdapter = new OwnershipInfoAdapter(connection);
        const personAdapter = new PersonAdapter(connection);
        await StockService.transferCOASeatReservation(data.authorization)(ownershipInfoAdapter, personAdapter);
    };
}

export function settleGMOAuthorization(
    data: SettleGMOAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.settleGMOAuth(data.authorization)();
    };
}

export function settleMvtkAuthorization(
    data: SettleMvtkAuthorizationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.settleMvtkAuthorization(data.authorization)();
    };
}
