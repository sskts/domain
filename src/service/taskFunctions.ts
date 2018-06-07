/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 */
import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import * as redis from 'redis';

import { MongoRepository as ActionRepo } from '../repo/action';
import { RedisRepository as RegisterProgramMembershipActionInProgressRepo } from '../repo/action/registerProgramMembershipInProgress';
import { MongoRepository as OrderRepo } from '../repo/order';
import { RedisRepository as OrderNumberRepo } from '../repo/orderNumber';
import { MongoRepository as OrganizationRepo } from '../repo/organization';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { CognitoRepository as PersonRepo } from '../repo/person';
import { MongoRepository as ProgramMembershipRepo } from '../repo/programMembership';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as DeliveryService from '../service/delivery';
import * as DiscountService from '../service/discount';
import * as NotificationService from '../service/notification';
import * as OrderService from '../service/order';
import * as PaymentService from '../service/payment';
import * as ProgramMembershipService from '../service/programMembership';
import * as StockService from '../service/stock';

export type IOperation<T> = (settings: {
    /**
     * MongoDBコネクション
     */
    connection: mongoose.Connection;
    /**
     * Redisクライアント
     */
    redisClient?: redis.RedisClient;
    /**
     * PecorinoAPI認証クライアント
     */
    pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    /**
     * Cognitoサービスプロバイダー
     */
    cognitoIdentityServiceProvider?: AWS.CognitoIdentityServiceProvider;
}) => Promise<T>;

export function sendEmailMessage(data: factory.task.sendEmailMessage.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        await NotificationService.sendEmailMessage(data.actionAttributes)({ action: actionRepo });
    };
}

export function cancelSeatReservation(data: factory.task.cancelSeatReservation.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        await StockService.cancelSeatReservationAuth(data.transactionId)({ action: actionRepo });
    };
}

export function cancelCreditCard(data: factory.task.cancelCreditCard.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        await PaymentService.creditCard.cancelCreditCardAuth(data.transactionId)({ action: actionRepo });
    };
}

export function cancelMvtk(data: factory.task.cancelMvtk.IData): IOperation<void> {
    return async (__: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        await DiscountService.mvtk.cancelMvtk(data.transactionId)();
    };
}

export function cancelPecorino(data: factory.task.cancelPecorino.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        await PaymentService.pecorino.cancelPecorinoAuth(data.transactionId)({
            action: actionRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function cancelPecorinoAward(data: factory.task.cancelPecorinoAward.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        await DeliveryService.cancelPecorinoAward(data)({
            action: new ActionRepo(settings.connection),
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function payCreditCard(data: factory.task.payCreditCard.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        const transactionRepo = new TransactionRepo(settings.connection);
        await PaymentService.creditCard.payCreditCard(data.transactionId)({
            action: actionRepo,
            transaction: transactionRepo
        });
    };
}

export function useMvtk(data: factory.task.useMvtk.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        const transactionRepo = new TransactionRepo(settings.connection);
        await DiscountService.mvtk.useMvtk(data.transactionId)({
            action: actionRepo,
            transaction: transactionRepo
        });
    };
}

export function payPecorino(data: factory.task.payPecorino.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        await PaymentService.pecorino.payPecorino(data)({
            action: actionRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function placeOrder(data: factory.task.placeOrder.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        const orderRepo = new OrderRepo(settings.connection);
        const transactionRepo = new TransactionRepo(settings.connection);
        const taskRepo = new TaskRepo(settings.connection);
        await OrderService.createFromTransaction(data.transactionId)({
            action: actionRepo,
            order: orderRepo,
            transaction: transactionRepo,
            task: taskRepo
        });
    };
}

export function refundCreditCard(data: factory.task.refundCreditCard.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        const transactionRepo = new TransactionRepo(settings.connection);
        const taskRepo = new TaskRepo(settings.connection);
        await PaymentService.creditCard.refundCreditCard(data.transactionId)({
            action: actionRepo,
            transaction: transactionRepo,
            task: taskRepo
        });
    };
}

export function refundPecorino(data: factory.task.refundPecorino.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        const taskRepo = new TaskRepo(settings.connection);
        await PaymentService.pecorino.refundPecorino(data)({
            action: actionRepo,
            task: taskRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function returnOrder(data: factory.task.returnOrder.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        const orderRepo = new OrderRepo(settings.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(settings.connection);
        const transactionRepo = new TransactionRepo(settings.connection);
        const taskRepo = new TaskRepo(settings.connection);
        await OrderService.cancelReservations(data.transactionId)(actionRepo, orderRepo, ownershipInfoRepo, transactionRepo, taskRepo);
    };
}

export function sendOrder(data: factory.task.returnOrder.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        redisClient?: redis.RedisClient;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.redisClient === undefined) {
            throw new Error('settings.redisClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        const orderRepo = new OrderRepo(settings.connection);
        const ownershipInfoRepo = new OwnershipInfoRepo(settings.connection);
        const transactionRepo = new TransactionRepo(settings.connection);
        const taskRepo = new TaskRepo(settings.connection);
        await DeliveryService.sendOrder(data.transactionId)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: new RegisterProgramMembershipActionInProgressRepo(settings.redisClient),
            transaction: transactionRepo,
            task: taskRepo
        });
    };
}

export function givePecorinoAward(data: factory.task.givePecorinoAward.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        await DeliveryService.givePecorinoAward(data)({
            action: actionRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function returnPecorinoAward(data: factory.task.returnPecorinoAward.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        await DeliveryService.returnPecorinoAward(data)({
            action: actionRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function registerProgramMembership(data: factory.task.registerProgramMembership.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        redisClient?: redis.RedisClient;
        cognitoIdentityServiceProvider?: AWS.CognitoIdentityServiceProvider;
    }) => {
        if (settings.redisClient === undefined) {
            throw new Error('settings.redisClient undefined.');
        }
        if (settings.cognitoIdentityServiceProvider === undefined) {
            throw new Error('settings.cognitoIdentityServiceProvider undefined.');
        }

        await ProgramMembershipService.register(data)({
            action: new ActionRepo(settings.connection),
            orderNumber: new OrderNumberRepo(settings.redisClient),
            organization: new OrganizationRepo(settings.connection),
            ownershipInfo: new OwnershipInfoRepo(settings.connection),
            person: new PersonRepo(settings.cognitoIdentityServiceProvider),
            programMembership: new ProgramMembershipRepo(settings.connection),
            registerActionInProgressRepo: new RegisterProgramMembershipActionInProgressRepo(settings.redisClient),
            transaction: new TransactionRepo(settings.connection)
        });
    };
}

export function unRegisterProgramMembership(data: factory.task.unRegisterProgramMembership.IData): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
    }) => {
        await ProgramMembershipService.unRegister(data)({
            action: new ActionRepo(settings.connection),
            ownershipInfo: new OwnershipInfoRepo(settings.connection),
            task: new TaskRepo(settings.connection)
        });
    };
}
