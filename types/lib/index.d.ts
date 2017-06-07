/// <reference types="mongoose" />
/**
 * sskts-domainモジュール
 *
 * @module
 */
import { Connection } from 'mongoose';
import { RedisClient } from 'redis';
import * as clientService from './service/client';
import * as masterService from './service/master';
import * as notificationService from './service/notification';
import * as queueService from './service/queue';
import * as reportService from './service/report';
import * as salesService from './service/sales';
import * as stockService from './service/stock';
import * as stockStatusService from './service/stockStatus';
import * as transactionService from './service/transaction';
import * as transactionWithIdService from './service/transactionWithId';
import AssetAdapter from './adapter/asset';
import ClientAdapter from './adapter/client';
import FilmAdapter from './adapter/film';
import GMONotificationAdapter from './adapter/gmoNotification';
import OwnerAdapter from './adapter/owner';
import PerformanceAdapter from './adapter/performance';
import QueueAdapter from './adapter/queue';
import ScreenAdapter from './adapter/screen';
import SendGridEventAdapter from './adapter/sendGridEvent';
import PerformanceStockStatusAdapter from './adapter/stockStatus/performance';
import TelemetryAdapter from './adapter/telemetry';
import TheaterAdapter from './adapter/theater';
import TransactionAdapter from './adapter/transaction';
import TransactionCountAdapter from './adapter/transactionCount';
import * as SeatReservationAssetFactory from './factory/asset/seatReservation';
import AssetGroup from './factory/assetGroup';
import * as CoaSeatReservationAuthorizationFactory from './factory/authorization/coaSeatReservation';
import * as GmoAuthorizationFactory from './factory/authorization/gmo';
import * as MvtkAuthorizationFactory from './factory/authorization/mvtk';
import AuthorizationGroup from './factory/authorizationGroup';
import * as ClientFactory from './factory/client';
import * as ClientEventFactory from './factory/clientEvent';
import * as FilmFactory from './factory/film';
import * as EmailNotificationFactory from './factory/notification/email';
import NotificationGroup from './factory/notificationGroup';
import * as AnonymousOwnerFactory from './factory/owner/anonymous';
import * as PromoterOwnerFactory from './factory/owner/promoter';
import OwnerGroup from './factory/ownerGroup';
import * as OwnershipFactory from './factory/ownership';
import * as PerformanceFactory from './factory/performance';
import * as CancelAuthorizationQueueFactory from './factory/queue/cancelAuthorization';
import * as DisableTransactionInquiryQueueFactory from './factory/queue/disableTransactionInquiry';
import * as PushNotificationQueueFactory from './factory/queue/pushNotification';
import * as SettleAuthorizationQueueFactory from './factory/queue/settleAuthorization';
import QueueGroup from './factory/queueGroup';
import QueueStatus from './factory/queueStatus';
import * as ScreenFactory from './factory/screen';
import * as PerformanceStockStatusFactory from './factory/stockStatus/performance';
import * as TheaterFactory from './factory/theater';
import * as TransactionFactory from './factory/transaction';
import * as AddNotificationTransactionEventFactory from './factory/transactionEvent/addNotification';
import * as AuthorizeTransactionEventFactory from './factory/transactionEvent/authorize';
import * as RemoveNotificationTransactionEventFactory from './factory/transactionEvent/removeNotification';
import * as UnauthorizeTransactionEventFactory from './factory/transactionEvent/unauthorize';
import TransactionEventGroup from './factory/transactionEventGroup';
import * as TransactionInquiryKeyFactory from './factory/transactionInquiryKey';
import TransactionQueuesStatus from './factory/transactionQueuesStatus';
import TransactionStatus from './factory/transactionStatus';
export declare const adapter: {
    asset: (connection: Connection) => AssetAdapter;
    client: (connection: Connection) => ClientAdapter;
    film: (connection: Connection) => FilmAdapter;
    gmoNotification: (connection: Connection) => GMONotificationAdapter;
    owner: (connection: Connection) => OwnerAdapter;
    performance: (connection: Connection) => PerformanceAdapter;
    stockStatus: {
        performance: (redisClient: RedisClient) => PerformanceStockStatusAdapter;
    };
    queue: (connection: Connection) => QueueAdapter;
    screen: (connection: Connection) => ScreenAdapter;
    sendGridEvent: (connection: Connection) => SendGridEventAdapter;
    telemetry: (connection: Connection) => TelemetryAdapter;
    theater: (connection: Connection) => TheaterAdapter;
    transaction: (connection: Connection) => TransactionAdapter;
    transactionCount: (redisClient: RedisClient) => TransactionCountAdapter;
};
export declare const service: {
    client: typeof clientService;
    master: typeof masterService;
    notification: typeof notificationService;
    queue: typeof queueService;
    report: typeof reportService;
    sales: typeof salesService;
    stock: typeof stockService;
    stockStatus: typeof stockStatusService;
    transaction: typeof transactionService;
    transactionWithId: typeof transactionWithIdService;
};
export declare const factory: {
    asset: {
        seatReservation: typeof SeatReservationAssetFactory;
    };
    assetGroup: typeof AssetGroup;
    authorization: {
        coaSeatReservation: typeof CoaSeatReservationAuthorizationFactory;
        gmo: typeof GmoAuthorizationFactory;
        mvtk: typeof MvtkAuthorizationFactory;
    };
    authorizationGroup: typeof AuthorizationGroup;
    client: typeof ClientFactory;
    clientEvent: typeof ClientEventFactory;
    film: typeof FilmFactory;
    notification: {
        email: typeof EmailNotificationFactory;
    };
    notificationGroup: typeof NotificationGroup;
    owner: {
        anonymous: typeof AnonymousOwnerFactory;
        promoter: typeof PromoterOwnerFactory;
    };
    ownerGroup: typeof OwnerGroup;
    ownership: typeof OwnershipFactory;
    performance: typeof PerformanceFactory;
    queue: {
        cancelAuthorization: typeof CancelAuthorizationQueueFactory;
        disableTransactionInquiry: typeof DisableTransactionInquiryQueueFactory;
        pushNotification: typeof PushNotificationQueueFactory;
        settleAuthorization: typeof SettleAuthorizationQueueFactory;
    };
    queueGroup: typeof QueueGroup;
    queueStatus: typeof QueueStatus;
    screen: typeof ScreenFactory;
    stockStatus: {
        performance: typeof PerformanceStockStatusFactory;
    };
    theater: typeof TheaterFactory;
    transaction: typeof TransactionFactory;
    transactionEvent: {
        addNotification: typeof AddNotificationTransactionEventFactory;
        authorize: typeof AuthorizeTransactionEventFactory;
        removeNotification: typeof RemoveNotificationTransactionEventFactory;
        unauthorize: typeof UnauthorizeTransactionEventFactory;
    };
    transactionEventGroup: typeof TransactionEventGroup;
    transactionInquiryKey: typeof TransactionInquiryKeyFactory;
    transactionQueuesStatus: typeof TransactionQueuesStatus;
    transactionStatus: typeof TransactionStatus;
};
