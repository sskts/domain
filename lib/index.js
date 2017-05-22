"use strict";
/**
 * sskts-domainモジュール
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const clientService = require("./service/client");
const masterService = require("./service/master");
const notificationService = require("./service/notification");
const queueService = require("./service/queue");
const reportService = require("./service/report");
const salesService = require("./service/sales");
const stockService = require("./service/stock");
const transactionService = require("./service/transaction");
const transactionWithIdService = require("./service/transactionWithId");
const asset_1 = require("./adapter/asset");
const client_1 = require("./adapter/client");
const film_1 = require("./adapter/film");
const gmoNotification_1 = require("./adapter/gmoNotification");
const owner_1 = require("./adapter/owner");
const performance_1 = require("./adapter/performance");
const queue_1 = require("./adapter/queue");
const screen_1 = require("./adapter/screen");
const sendGridEvent_1 = require("./adapter/sendGridEvent");
const performance_2 = require("./adapter/stockStatus/performance");
const telemetry_1 = require("./adapter/telemetry");
const theater_1 = require("./adapter/theater");
const transaction_1 = require("./adapter/transaction");
const SeatReservationAssetFactory = require("./factory/asset/seatReservation");
const assetGroup_1 = require("./factory/assetGroup");
const CoaSeatReservationAuthorizationFactory = require("./factory/authorization/coaSeatReservation");
const GmoAuthorizationFactory = require("./factory/authorization/gmo");
const MvtkAuthorizationFactory = require("./factory/authorization/mvtk");
const authorizationGroup_1 = require("./factory/authorizationGroup");
const ClientFactory = require("./factory/client");
const ClientEventFactory = require("./factory/clientEvent");
const FilmFactory = require("./factory/film");
const EmailNotificationFactory = require("./factory/notification/email");
const notificationGroup_1 = require("./factory/notificationGroup");
const AnonymousOwnerFactory = require("./factory/owner/anonymous");
const PromoterOwnerFactory = require("./factory/owner/promoter");
const ownerGroup_1 = require("./factory/ownerGroup");
const OwnershipFactory = require("./factory/ownership");
const PerformanceFactory = require("./factory/performance");
const CancelAuthorizationQueueFactory = require("./factory/queue/cancelAuthorization");
const DisableTransactionInquiryQueueFactory = require("./factory/queue/disableTransactionInquiry");
const PushNotificationQueueFactory = require("./factory/queue/pushNotification");
const SettleAuthorizationQueueFactory = require("./factory/queue/settleAuthorization");
const queueGroup_1 = require("./factory/queueGroup");
const queueStatus_1 = require("./factory/queueStatus");
const ScreenFactory = require("./factory/screen");
const PerformanceStockStatusFactory = require("./factory/stockStatus/performance");
const TheaterFactory = require("./factory/theater");
const TransactionFactory = require("./factory/transaction");
const AddNotificationTransactionEventFactory = require("./factory/transactionEvent/addNotification");
const AuthorizeTransactionEventFactory = require("./factory/transactionEvent/authorize");
const RemoveNotificationTransactionEventFactory = require("./factory/transactionEvent/removeNotification");
const UnauthorizeTransactionEventFactory = require("./factory/transactionEvent/unauthorize");
const transactionEventGroup_1 = require("./factory/transactionEventGroup");
const TransactionInquiryKeyFactory = require("./factory/transactionInquiryKey");
const transactionQueuesStatus_1 = require("./factory/transactionQueuesStatus");
const transactionStatus_1 = require("./factory/transactionStatus");
exports.adapter = {
    asset: (connection) => {
        return new asset_1.default(connection);
    },
    client: (connection) => {
        return new client_1.default(connection);
    },
    film: (connection) => {
        return new film_1.default(connection);
    },
    gmoNotification: (connection) => {
        return new gmoNotification_1.default(connection);
    },
    owner: (connection) => {
        return new owner_1.default(connection);
    },
    performance: (connection) => {
        return new performance_1.default(connection);
    },
    stockStatus: {
        performance: (redisUrl) => {
            return new performance_2.default(redisUrl);
        }
    },
    queue: (connection) => {
        return new queue_1.default(connection);
    },
    screen: (connection) => {
        return new screen_1.default(connection);
    },
    sendGridEvent: (connection) => {
        return new sendGridEvent_1.default(connection);
    },
    telemetry: (connection) => {
        return new telemetry_1.default(connection);
    },
    theater: (connection) => {
        return new theater_1.default(connection);
    },
    transaction: (connection) => {
        return new transaction_1.default(connection);
    }
};
exports.service = {
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
exports.factory = {
    asset: {
        seatReservation: SeatReservationAssetFactory
    },
    assetGroup: assetGroup_1.default,
    authorization: {
        coaSeatReservation: CoaSeatReservationAuthorizationFactory,
        gmo: GmoAuthorizationFactory,
        mvtk: MvtkAuthorizationFactory
    },
    authorizationGroup: authorizationGroup_1.default,
    client: ClientFactory,
    clientEvent: ClientEventFactory,
    film: FilmFactory,
    notification: {
        email: EmailNotificationFactory
    },
    notificationGroup: notificationGroup_1.default,
    owner: {
        anonymous: AnonymousOwnerFactory,
        promoter: PromoterOwnerFactory
    },
    ownerGroup: ownerGroup_1.default,
    ownership: OwnershipFactory,
    performance: PerformanceFactory,
    queue: {
        cancelAuthorization: CancelAuthorizationQueueFactory,
        disableTransactionInquiry: DisableTransactionInquiryQueueFactory,
        pushNotification: PushNotificationQueueFactory,
        settleAuthorization: SettleAuthorizationQueueFactory
    },
    queueGroup: queueGroup_1.default,
    queueStatus: queueStatus_1.default,
    screen: ScreenFactory,
    stockStatus: {
        performance: PerformanceStockStatusFactory
    },
    theater: TheaterFactory,
    transaction: TransactionFactory,
    transactionEvent: {
        addNotification: AddNotificationTransactionEventFactory,
        authorize: AuthorizeTransactionEventFactory,
        removeNotification: RemoveNotificationTransactionEventFactory,
        unauthorize: UnauthorizeTransactionEventFactory
    },
    transactionEventGroup: transactionEventGroup_1.default,
    transactionInquiryKey: TransactionInquiryKeyFactory,
    transactionQueuesStatus: transactionQueuesStatus_1.default,
    transactionStatus: transactionStatus_1.default
};
