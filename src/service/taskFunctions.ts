/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/taskFunctions
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import OrderAdapter from '../adapter/order';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';

import * as NotificationService from '../service/notification';
import * as OrderService from '../service/order';
import * as SalesService from '../service/sales';
import * as StockService from '../service/stock';

const debug = createDebug('sskts-domain:service:taskFunctions');

export type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;

export function sendEmailNotification(
    data: factory.task.sendEmailNotification.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        debug('creating adapters on connection...', connection);
        await NotificationService.sendEmail(data.notification)();
    };
}

export function cancelSeatReservation(
    data: factory.task.cancelSeatReservation.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await StockService.unauthorizeSeatReservation(data.transaction)();
    };
}

export function cancelGMO(
    data: factory.task.cancelGMO.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.cancelGMOAuth(data.transaction)();
    };
}

export function cancelMvtk(
    data: factory.task.cancelMvtk.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.cancelMvtk(data.transaction)();
    };
}

export function settleSeatReservation(
    data: factory.task.settleSeatReservation.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        const ownershipInfoAdapter = new OwnershipInfoAdapter(connection);
        const personAdapter = new PersonAdapter(connection);
        await StockService.transferSeatReservation(data.transaction)(ownershipInfoAdapter, personAdapter);
    };
}

export function settleGMO(
    data: factory.task.settleGMO.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.settleGMOAuth(data.transaction)();
    };
}

export function settleMvtk(
    data: factory.task.settleMvtk.IData
): IOperation<void> {
    debug('executing...', data);

    return async (__: mongoose.Connection) => {
        await SalesService.settleMvtk(data.transaction)();
    };
}

export function createOrder(
    data: factory.task.createOrder.IData
): IOperation<void> {
    debug('executing...', data);

    return async (connection: mongoose.Connection) => {
        const orderAdapter = new OrderAdapter(connection);
        await OrderService.createFromTransaction(data.transaction)(orderAdapter);
    };
}
