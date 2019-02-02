/**
 * タスクファンクションサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 */
import { mongoose, service } from '@cinerino/domain';
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as redis from 'redis';

import { MongoRepository as ActionRepo } from '../repo/action';
import { RedisRepository as RegisterProgramMembershipActionInProgressRepo } from '../repo/action/registerProgramMembershipInProgress';
import { MongoRepository as EventRepo } from '../repo/event';
import { MongoRepository as OrderRepo } from '../repo/order';
import { RedisRepository as OrderNumberRepo } from '../repo/orderNumber';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { CognitoRepository as PersonRepo } from '../repo/person';
import { MongoRepository as PlaceRepo } from '../repo/place';
import { MongoRepository as ProgramMembershipRepo } from '../repo/programMembership';
import { MongoRepository as SellerRepo } from '../repo/seller';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as DeliveryService from '../service/delivery';
import * as MasterSyncService from '../service/masterSync';
import * as OrderService from '../service/order';
import * as PaymentService from '../service/payment';
import * as ProgramMembershipService from '../service/programMembership';
import * as StockService from '../service/stock';

import * as factory from '../factory';

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
     * PecorinoAPIエンドポイント
     */
    pecorinoEndpoint?: string;
    /**
     * PecorinoAPI認証クライアント
     */
    pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    /**
     * Cognitoサービスプロバイダー
     */
    cognitoIdentityServiceProvider?: AWS.CognitoIdentityServiceProvider;
}) => Promise<T>;

export function sendEmailMessage(data: factory.task.IData<factory.taskName.SendEmailMessage>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        await service.notification.sendEmailMessage(data.actionAttributes)({ action: actionRepo });
    };
}

export function cancelSeatReservation(data: factory.task.IData<factory.taskName.CancelSeatReservation>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        await StockService.cancelSeatReservationAuth(data.transactionId)({ action: actionRepo });
    };
}

export function cancelCreditCard(data: factory.task.IData<factory.taskName.CancelCreditCard>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        const actionRepo = new ActionRepo(settings.connection);
        await PaymentService.creditCard.cancelCreditCardAuth(data.transactionId)({ action: actionRepo });
    };
}

export function cancelAccount(data: factory.task.IData<factory.taskName.CancelAccount>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoEndpoint?: string;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoEndpoint === undefined) {
            throw new Error('settings.pecorinoEndpoint undefined.');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        const withdrawService = new pecorinoapi.service.transaction.Withdraw({
            endpoint: settings.pecorinoEndpoint,
            auth: settings.pecorinoAuthClient
        });
        const transferService = new pecorinoapi.service.transaction.Transfer({
            endpoint: settings.pecorinoEndpoint,
            auth: settings.pecorinoAuthClient
        });
        await PaymentService.account.cancelAccountAuth(data)({
            action: actionRepo,
            withdrawService: withdrawService,
            transferService: transferService
        });
    };
}

export function cancelPointAward(data: factory.task.IData<factory.taskName.CancelPointAward>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        await DeliveryService.cancelPointAward(data)({
            action: new ActionRepo(settings.connection),
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function payCreditCard(data: factory.task.IData<factory.taskName.PayCreditCard>): IOperation<void> {
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

// export function useMvtk(data: factory.task.IData<factory.taskName.PayMovieTicket>): IOperation<void> {
//     return async (settings: {
//         connection: mongoose.Connection;
//         pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
//     }) => {
//         const actionRepo = new ActionRepo(settings.connection);
//         const transactionRepo = new TransactionRepo(settings.connection);
//         await DiscountService.mvtk.useMvtk(data.transactionId)({
//             action: actionRepo,
//             transaction: transactionRepo
//         });
//     };
// }

export function payAccount(data: factory.task.IData<factory.taskName.PayAccount>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoEndpoint?: string;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoEndpoint === undefined) {
            throw new Error('settings.pecorinoEndpoint undefined.');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        const withdrawService = new pecorinoapi.service.transaction.Withdraw({
            endpoint: settings.pecorinoEndpoint,
            auth: settings.pecorinoAuthClient
        });
        const transferService = new pecorinoapi.service.transaction.Transfer({
            endpoint: settings.pecorinoEndpoint,
            auth: settings.pecorinoAuthClient
        });
        await PaymentService.account.payAccount(data)({
            action: actionRepo,
            withdrawService: withdrawService,
            transferService: transferService
        });
    };
}

export function placeOrder(data: factory.task.IData<factory.taskName.PlaceOrder>): IOperation<void> {
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

export function refundCreditCard(data: factory.task.IData<factory.taskName.RefundCreditCard>): IOperation<void> {
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

export function refundAccount(data: factory.task.IData<factory.taskName.RefundAccount>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoEndpoint?: string;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoEndpoint === undefined) {
            throw new Error('settings.pecorinoEndpoint undefined.');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        const taskRepo = new TaskRepo(settings.connection);
        const depositService = new pecorinoapi.service.transaction.Deposit({
            endpoint: settings.pecorinoEndpoint,
            auth: settings.pecorinoAuthClient
        });
        const transferService = new pecorinoapi.service.transaction.Transfer({
            endpoint: settings.pecorinoEndpoint,
            auth: settings.pecorinoAuthClient
        });
        await PaymentService.account.refundAccount(data)({
            action: actionRepo,
            task: taskRepo,
            depositService: depositService,
            transferService: transferService
        });
    };
}

export function returnOrder(data: factory.task.IData<factory.taskName.ReturnOrder>): IOperation<void> {
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

export function sendOrder(data: factory.task.IData<factory.taskName.SendOrder>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        redisClient?: redis.RedisClient;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
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

export function givePointAward(data: factory.task.IData<factory.taskName.GivePointAward>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        await DeliveryService.givePointAward(data)({
            action: actionRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function returnPointAward(data: factory.task.IData<factory.taskName.ReturnPointAward>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.pecorinoAuthClient === undefined) {
            throw new Error('settings.pecorinoAuthClient undefined.');
        }

        const actionRepo = new ActionRepo(settings.connection);
        await DeliveryService.returnPointAward(data)({
            action: actionRepo,
            pecorinoAuthClient: settings.pecorinoAuthClient
        });
    };
}

export function registerProgramMembership(data: factory.task.IData<factory.taskName.RegisterProgramMembership>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        redisClient?: redis.RedisClient;
        cognitoIdentityServiceProvider?: AWS.CognitoIdentityServiceProvider;
        depositService?: pecorinoapi.service.transaction.Deposit;
    }) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.redisClient === undefined) {
            throw new Error('settings.redisClient undefined.');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.cognitoIdentityServiceProvider === undefined) {
            throw new Error('settings.cognitoIdentityServiceProvider undefined.');
        }

        await ProgramMembershipService.register(data)({
            action: new ActionRepo(settings.connection),
            orderNumber: new OrderNumberRepo(settings.redisClient),
            seller: new SellerRepo(settings.connection),
            ownershipInfo: new OwnershipInfoRepo(settings.connection),
            person: new PersonRepo(settings.cognitoIdentityServiceProvider),
            programMembership: new ProgramMembershipRepo(settings.connection),
            registerActionInProgressRepo: new RegisterProgramMembershipActionInProgressRepo(settings.redisClient),
            transaction: new TransactionRepo(settings.connection),
            depositService: settings.depositService
        });
    };
}

export function unRegisterProgramMembership(data: factory.task.IData<factory.taskName.UnRegisterProgramMembership>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
        cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
    }) => {
        await ProgramMembershipService.unRegister(data)({
            action: new ActionRepo(settings.connection),
            ownershipInfo: new OwnershipInfoRepo(settings.connection),
            task: new TaskRepo(settings.connection),
            person: new PersonRepo(settings.cognitoIdentityServiceProvider)
        });
    };
}

export function triggerWebhook(data: factory.task.IData<factory.taskName.TriggerWebhook>): IOperation<void> {
    return async (_: {
        connection: mongoose.Connection;
        cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
    }) => {
        await service.notification.triggerWebhook(data)();
    };
}

export function importScreeningEvents(data: factory.task.IData<factory.taskName.ImportScreeningEvents>): IOperation<void> {
    return async (settings: {
        connection: mongoose.Connection;
    }) => {
        const eventRepo = new EventRepo(settings.connection);
        const placeRepo = new PlaceRepo(settings.connection);

        await MasterSyncService.importScreeningEvents(
            data.locationBranchCode,
            data.importFrom,
            data.importThrough,
            data.xmlEndPoint
        )({
            event: eventRepo,
            place: placeRepo
        });
    };
}
