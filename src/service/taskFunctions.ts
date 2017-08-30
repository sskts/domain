/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 * @namespace service/taskFunctions
 */

import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';

import OrderAdapter from '../adapter/order';
import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import TransactionAdapter from '../adapter/transaction';

import * as NotificationService from '../service/notification';
import * as OrderService from '../service/order';
import * as SalesService from '../service/sales';
import * as StockService from '../service/stock';

export type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;

export function sendEmailNotification(
    data: factory.task.sendEmailNotification.IData
): IOperation<void> {
    return async (__: mongoose.Connection) => {
        await NotificationService.sendEmail(data.notification)();
    };
}

export function cancelSeatReservation(
    data: factory.task.cancelSeatReservation.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionAdapter = new TransactionAdapter(connection);
        await StockService.unauthorizeSeatReservation(data.transactionId)(transactionAdapter);
    };
}

export function cancelGMO(
    data: factory.task.cancelGMO.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionAdapter = new TransactionAdapter(connection);
        await SalesService.cancelGMOAuth(data.transactionId)(transactionAdapter);
    };
}

export function cancelMvtk(
    data: factory.task.cancelMvtk.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionAdapter = new TransactionAdapter(connection);
        await SalesService.cancelMvtk(data.transactionId)(transactionAdapter);
    };
}

export function settleSeatReservation(
    data: factory.task.settleSeatReservation.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const ownershipInfoAdapter = new OwnershipInfoAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);
        await StockService.transferSeatReservation(data.transactionId)(ownershipInfoAdapter, transactionAdapter);
    };
}

export function settleGMO(
    data: factory.task.settleGMO.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionAdapter = new TransactionAdapter(connection);
        await SalesService.settleGMOAuth(data.transactionId)(transactionAdapter);
    };
}

export function settleMvtk(
    data: factory.task.settleMvtk.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionAdapter = new TransactionAdapter(connection);
        await SalesService.settleMvtk(data.transactionId)(transactionAdapter);
    };
}

export function createOrder(
    data: factory.task.createOrder.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const orderAdapter = new OrderAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);
        await OrderService.createFromTransaction(data.transactionId)(orderAdapter, transactionAdapter);
    };
}
