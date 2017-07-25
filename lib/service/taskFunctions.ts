/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/taskFunctions
 */

import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import OrderAdapter from '../adapter/order';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';

import * as CancelGMOTaskFactory from '../factory/task/cancelGMO';
import * as CancelMvtkTaskFactory from '../factory/task/cancelMvtk';
import * as CancelSeatReservationTaskFactory from '../factory/task/cancelSeatReservation';
import * as CreateOrderTaskFactory from '../factory/task/createOrder';
import * as SendEmailNotificationTaskFactory from '../factory/task/sendEmailNotification';
import * as SettleGMOTaskFactory from '../factory/task/settleGMO';
import * as SettleMvtkTaskFactory from '../factory/task/settleMvtk';
import * as SettleSeatReservationTaskFactory from '../factory/task/settleSeatReservation';

import * as NotificationService from '../service/notification';
import * as OrderService from '../service/order';
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

export function cancelSeatReservation(
    data: CancelSeatReservationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await StockService.unauthorizeSeatReservation(data.transaction)();
    };
}

export function cancelGMO(
    data: CancelGMOTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.cancelGMOAuth(data.transaction)();
    };
}

export function cancelMvtk(
    data: CancelMvtkTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.cancelMvtk(data.transaction)();
    };
}

export function settleSeatReservation(
    data: SettleSeatReservationTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        const ownershipInfoAdapter = new OwnershipInfoAdapter(connection);
        const personAdapter = new PersonAdapter(connection);
        await StockService.transferSeatReservation(data.transaction)(ownershipInfoAdapter, personAdapter);
    };
}

export function settleGMO(
    data: SettleGMOTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.settleGMOAuth(data.transaction)();
    };
}

export function settleMvtk(
    data: SettleMvtkTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.settleMvtk(data.transaction)();
    };
}

export function createOrder(
    data: CreateOrderTaskFactory.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        const orderAdapter = new OrderAdapter(connection);
        await OrderService.createFromTransaction(data.transaction)(orderAdapter);
    };
}
