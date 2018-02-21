/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 * @namespace service.taskFunctions
 */

import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as DeliveryService from '../service/delivery';
import * as NotificationService from '../service/notification';
import * as OrderService from '../service/order';
import * as PaymentService from '../service/payment';
import * as StockService from '../service/stock';

export type IOperation<T> = (
    connection: mongoose.Connection,
    pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials
) => Promise<T>;

export function sendEmailMessage(
    data: factory.task.sendEmailMessage.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        await NotificationService.sendEmailMessage(data.actionAttributes)(actionRepo);
    };
}

export function cancelSeatReservation(
    data: factory.task.cancelSeatReservation.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        await StockService.cancelSeatReservationAuth(data.transactionId)(actionRepo);
    };
}

export function cancelCreditCard(
    data: factory.task.cancelCreditCard.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        await PaymentService.cancelCreditCardAuth(data.transactionId)(actionRepo);
    };
}

export function cancelMvtk(
    data: factory.task.cancelMvtk.IData
): IOperation<void> {
    return async (__: mongoose.Connection) => {
        await PaymentService.cancelMvtk(data.transactionId)();
    };
}

export function payCreditCard(
    data: factory.task.payCreditCard.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        await PaymentService.payCreditCard(data.transactionId)(actionRepo, transactionRepo);
    };
}

export function useMvtk(
    data: factory.task.useMvtk.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        await PaymentService.useMvtk(data.transactionId)(actionRepo, transactionRepo);
    };
}

export function payPecorino(
    data: factory.task.payPecorino.IData
): IOperation<void> {
    return async (connection: mongoose.Connection, pecorinoAuthClient: pecorinoapi.auth.ClientCredentials) => {
        const actionRepo = new ActionRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        await PaymentService.payPecorino(data.transactionId)(actionRepo, transactionRepo, pecorinoAuthClient);
    };
}

export function placeOrder(
    data: factory.task.placeOrder.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        const orderRepository = new OrderRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        const taskRepo = new TaskRepo(connection);
        await OrderService.createFromTransaction(data.transactionId)(actionRepo, orderRepository, transactionRepo, taskRepo);
    };
}

export function refundCreditCard(
    data: factory.task.refundCreditCard.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        const taskRepo = new TaskRepo(connection);
        await PaymentService.refundCreditCard(data.transactionId)(actionRepo, transactionRepo, taskRepo);
    };
}

export function returnOrder(
    data: factory.task.returnOrder.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        const orderRepo = new OrderRepo(connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        const taskRepo = new TaskRepo(connection);
        await OrderService.cancelReservations(data.transactionId)(actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo);
    };
}

export function sendOrder(
    data: factory.task.returnOrder.IData
): IOperation<void> {
    return async (connection: mongoose.Connection) => {
        const actionRepo = new ActionRepo(connection);
        const orderRepo = new OrderRepo(connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(connection);
        const transactionRepo = new TransactionRepo(connection);
        const taskRepo = new TaskRepo(connection);
        await DeliveryService.sendOrder(data.transactionId)(actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo);
    };
}
