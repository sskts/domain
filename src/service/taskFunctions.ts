/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 * @namespace service.taskFunctions
 */

import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';

import { MongoRepository as AuthorizeActionRepository } from '../repo/action/authorize';
import { MongoRepository as OrderRepository } from '../repo/order';
import { MongoRepository as OwnershipInfoRepository } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepository } from '../repo/transaction';

import * as NotificationService from '../service/notification';
import * as OrderService from '../service/order';
import * as OwnershipInfoService from '../service/ownershipInfo';
import * as SalesService from '../service/sales';
import * as StockService from '../service/stock';

export type IOperation<T> = (connection: mongoose.Connection) => Promise<T>;

export function sendEmailNotification(
    data: factory.task.sendEmailNotification.IData
): IOperation<void> {
    return async (__: mongoose.Connection) => {
        await NotificationService.sendEmail(data.emailMessage)();
    };
}

export function cancelSeatReservation(
    data: factory.task.cancelSeatReservation.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const authorizeActionRepo = new AuthorizeActionRepository(connection);
        await StockService.cancelSeatReservationAuth(data.transactionId)(authorizeActionRepo);
    };
}

export function cancelCreditCard(
    data: factory.task.cancelCreditCard.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const authorizeActionRepo = new AuthorizeActionRepository(connection);
        await SalesService.cancelCreditCardAuth(data.transactionId)(authorizeActionRepo);
    };
}

export function cancelMvtk(
    data: factory.task.cancelMvtk.IData
): IOperation<void> {
    return async (__: mongoose.Connection) => {
        await SalesService.cancelMvtk(data.transactionId)();
    };
}

export function settleSeatReservation(
    data: factory.task.settleSeatReservation.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionRepository = new TransactionRepository(connection);
        await StockService.transferSeatReservation(data.transactionId)(transactionRepository);
    };
}

export function settleCreditCard(
    data: factory.task.settleCreditCard.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const transactionRepository = new TransactionRepository(connection);
        await SalesService.settleCreditCardAuth(data.transactionId)(transactionRepository);
    };
}

export function settleMvtk(
    data: factory.task.settleMvtk.IData
): IOperation<void> {
    return async (__: mongoose.Connection) => {
        await SalesService.settleMvtk(data.transactionId)();
    };
}

export function createOrder(
    data: factory.task.createOrder.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const orderRepository = new OrderRepository(connection);
        const transactionRepository = new TransactionRepository(connection);
        await OrderService.createFromTransaction(data.transactionId)(orderRepository, transactionRepository);
    };
}

export function createOwnershipInfos(
    data: factory.task.createOrder.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const ownershipInfoRepository = new OwnershipInfoRepository(connection);
        const transactionRepository = new TransactionRepository(connection);
        await OwnershipInfoService.createFromTransaction(data.transactionId)(ownershipInfoRepository, transactionRepository);
    };
}
