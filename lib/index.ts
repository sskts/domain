/**
 * sskts-domainモジュール
 *
 * @module
 */
import { Connection } from 'mongoose';

import * as clientService from './service/client';
import * as masterService from './service/master';
import * as notificationService from './service/notification';
import * as queueService from './service/queue';
import * as reportService from './service/report';
import * as salesService from './service/sales';
import * as stockService from './service/stock';
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
import TelemetryAdapter from './adapter/telemetry';
import TheaterAdapter from './adapter/theater';
import TransactionAdapter from './adapter/transaction';

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

export const adapter = {
    asset: (connection: Connection) => {
        return new AssetAdapter(connection);
    },
    client: (connection: Connection) => {
        return new ClientAdapter(connection);
    },
    film: (connection: Connection) => {
        return new FilmAdapter(connection);
    },
    gmoNotification: (connection: Connection) => {
        return new GMONotificationAdapter(connection);
    },
    owner: (connection: Connection) => {
        return new OwnerAdapter(connection);
    },
    performance: (connection: Connection) => {
        return new PerformanceAdapter(connection);
    },
    queue: (connection: Connection) => {
        return new QueueAdapter(connection);
    },
    screen: (connection: Connection) => {
        return new ScreenAdapter(connection);
    },
    sendGridEvent: (connection: Connection) => {
        return new SendGridEventAdapter(connection);
    },
    telemetry: (connection: Connection) => {
        return new TelemetryAdapter(connection);
    },
    theater: (connection: Connection) => {
        return new TheaterAdapter(connection);
    },
    transaction: (connection: Connection) => {
        return new TransactionAdapter(connection);
    }
};

export const service = {
    client: clientService,
    master: masterService,
    notification: notificationService,
    queue: queueService,
    report: reportService,
    sales: salesService,
    stock: stockService,
    transaction: transactionService,
    transactionWithId: transactionWithIdService
};

export const factory = {
    asset: {
        seatReservation: SeatReservationAssetFactory
    },
    assetGroup: AssetGroup,
    authorization: {
        coaSeatReservation: CoaSeatReservationAuthorizationFactory,
        gmo: GmoAuthorizationFactory,
        mvtk: MvtkAuthorizationFactory
    },
    authorizationGroup: AuthorizationGroup,
    client: ClientFactory,
    clientEvent: ClientEventFactory,
    film: FilmFactory,
    notification: {
        email: EmailNotificationFactory
    },
    notificationGroup: NotificationGroup,
    owner: {
        anonymous: AnonymousOwnerFactory,
        promoter: PromoterOwnerFactory
    },
    ownerGroup: OwnerGroup,
    ownership: OwnershipFactory,
    performance: PerformanceFactory,
    queue: {
        cancelAuthorization: CancelAuthorizationQueueFactory,
        disableTransactionInquiry: DisableTransactionInquiryQueueFactory,
        pushNotification: PushNotificationQueueFactory,
        settleAuthorization: SettleAuthorizationQueueFactory
    },
    queueGroup: QueueGroup,
    queueStatus: QueueStatus,
    screen: ScreenFactory,
    theater: TheaterFactory,
    transaction: TransactionFactory,
    transactionEvent: {
        addNotification: AddNotificationTransactionEventFactory,
        authorize: AuthorizeTransactionEventFactory,
        removeNotification: RemoveNotificationTransactionEventFactory,
        unauthorize: UnauthorizeTransactionEventFactory
    },
    transactionEventGroup: TransactionEventGroup,
    transactionInquiryKey: TransactionInquiryKeyFactory,
    transactionQueuesStatus: TransactionQueuesStatus,
    transactionStatus: TransactionStatus
};
