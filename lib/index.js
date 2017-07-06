"use strict";
/**
 * sskts-domainモジュール
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const mongoose = require("mongoose");
const redis = require("redis");
const ClientService = require("./service/client");
const MasterService = require("./service/master");
const MemberService = require("./service/member");
const NotificationService = require("./service/notification");
const ReportService = require("./service/report");
const SalesService = require("./service/sales");
const ShopService = require("./service/shop");
const StockService = require("./service/stock");
const StockStatusService = require("./service/stockStatus");
const TaskService = require("./service/task");
const TransactionService = require("./service/transaction");
const TransactionWithIdService = require("./service/transactionWithId");
const asset_1 = require("./adapter/asset");
const client_1 = require("./adapter/client");
const film_1 = require("./adapter/film");
const gmoNotification_1 = require("./adapter/gmoNotification");
const owner_1 = require("./adapter/owner");
const performance_1 = require("./adapter/performance");
const screen_1 = require("./adapter/screen");
const sendGridEvent_1 = require("./adapter/sendGridEvent");
const performance_2 = require("./adapter/stockStatus/performance");
const task_1 = require("./adapter/task");
const telemetry_1 = require("./adapter/telemetry");
const theater_1 = require("./adapter/theater");
const transaction_1 = require("./adapter/transaction");
const transactionCount_1 = require("./adapter/transactionCount");
const SeatReservationAssetFactory = require("./factory/asset/seatReservation");
const assetGroup_1 = require("./factory/assetGroup");
const CoaSeatReservationAuthorizationFactory = require("./factory/authorization/coaSeatReservation");
const GmoAuthorizationFactory = require("./factory/authorization/gmo");
const MvtkAuthorizationFactory = require("./factory/authorization/mvtk");
const authorizationGroup_1 = require("./factory/authorizationGroup");
const GMOCardFactory = require("./factory/card/gmo");
const cardGroup_1 = require("./factory/cardGroup");
const GMOCardIdFactory = require("./factory/cardId/gmo");
const ClientFactory = require("./factory/client");
const ClientEventFactory = require("./factory/clientEvent");
const ClientUserFactory = require("./factory/clientUser");
const FilmFactory = require("./factory/film");
const EmailNotificationFactory = require("./factory/notification/email");
const notificationGroup_1 = require("./factory/notificationGroup");
const AnonymousOwnerFactory = require("./factory/owner/anonymous");
const MemberOwnerFactory = require("./factory/owner/member");
const PromoterOwnerFactory = require("./factory/owner/promoter");
const ownerGroup_1 = require("./factory/ownerGroup");
const OwnershipFactory = require("./factory/ownership");
const PerformanceFactory = require("./factory/performance");
const ScreenFactory = require("./factory/screen");
const PerformanceStockStatusFactory = require("./factory/stockStatus/performance");
const TaskFactory = require("./factory/task");
const TaskExecutionResultFactory = require("./factory/taskExecutionResult");
const taskName_1 = require("./factory/taskName");
const taskStatus_1 = require("./factory/taskStatus");
const TheaterFactory = require("./factory/theater");
const theaterWebsiteGroup_1 = require("./factory/theaterWebsiteGroup");
const TransactionFactory = require("./factory/transaction");
const AddNotificationTransactionEventFactory = require("./factory/transactionEvent/addNotification");
const AuthorizeTransactionEventFactory = require("./factory/transactionEvent/authorize");
const RemoveNotificationTransactionEventFactory = require("./factory/transactionEvent/removeNotification");
const UnauthorizeTransactionEventFactory = require("./factory/transactionEvent/unauthorize");
const transactionEventGroup_1 = require("./factory/transactionEventGroup");
const TransactionInquiryKeyFactory = require("./factory/transactionInquiryKey");
const TransactionScopeFactory = require("./factory/transactionScope");
const transactionStatus_1 = require("./factory/transactionStatus");
const transactionTasksExportationStatus_1 = require("./factory/transactionTasksExportationStatus");
const errorCode_1 = require("./errorCode");
/**
 * MongoDBクライアント`mongoose`
 *
 * @example
 * var promise = sskts.mongoose.connect('mongodb://localhost/myapp', {
 *     useMongoClient: true
 * });
 */
exports.mongoose = mongoose;
/**
 * Redis Cacheクライアント
 *
 * @example
 * const client = sskts.redis.createClient({
 *      host: process.env.REDIS_HOST,
 *      port: process.env.REDIS_PORT,
 *      password: process.env.REDIS_KEY,
 *      tls: { servername: process.env.TEST_REDIS_HOST }
 * });
 */
exports.redis = redis;
/**
 * COAのAPIクライアント
 *
 * @example
 * sskts.COA.services.master.theater({ theater_code: '118' }).then(() => {
 *     console.log(result);
 * });
 */
exports.COA = COA;
/**
 * GMOのAPIクライアント
 *
 * @example
 * sskts.GMO.services.card.searchMember({
 *     siteId: '',
 *     sitePass: '',
 *     memberId: ''
 * }).then((result) => {
 *     console.log(result);
 * });
 */
exports.GMO = GMO;
var adapter;
(function (adapter) {
    function asset(connection) {
        return new asset_1.default(connection);
    }
    adapter.asset = asset;
    function client(connection) {
        return new client_1.default(connection);
    }
    adapter.client = client;
    function film(connection) {
        return new film_1.default(connection);
    }
    adapter.film = film;
    function gmoNotification(connection) {
        return new gmoNotification_1.default(connection);
    }
    adapter.gmoNotification = gmoNotification;
    function owner(connection) {
        return new owner_1.default(connection);
    }
    adapter.owner = owner;
    function performance(connection) {
        return new performance_1.default(connection);
    }
    adapter.performance = performance;
    let stockStatus;
    (function (stockStatus) {
        // tslint:disable-next-line:no-shadowed-variable
        function performance(redisClient) {
            return new performance_2.default(redisClient);
        }
        stockStatus.performance = performance;
    })(stockStatus = adapter.stockStatus || (adapter.stockStatus = {}));
    function screen(connection) {
        return new screen_1.default(connection);
    }
    adapter.screen = screen;
    function sendGridEvent(connection) {
        return new sendGridEvent_1.default(connection);
    }
    adapter.sendGridEvent = sendGridEvent;
    function task(connection) {
        return new task_1.default(connection);
    }
    adapter.task = task;
    function telemetry(connection) {
        return new telemetry_1.default(connection);
    }
    adapter.telemetry = telemetry;
    function theater(connection) {
        return new theater_1.default(connection);
    }
    adapter.theater = theater;
    function transaction(connection) {
        return new transaction_1.default(connection);
    }
    adapter.transaction = transaction;
    function transactionCount(redisClient) {
        return new transactionCount_1.default(redisClient);
    }
    adapter.transactionCount = transactionCount;
})(adapter = exports.adapter || (exports.adapter = {}));
var service;
(function (service) {
    service.client = ClientService;
    service.master = MasterService;
    service.member = MemberService;
    service.notification = NotificationService;
    service.report = ReportService;
    service.sales = SalesService;
    service.shop = ShopService;
    service.stock = StockService;
    service.stockStatus = StockStatusService;
    service.task = TaskService;
    service.transaction = TransactionService;
    service.transactionWithId = TransactionWithIdService;
})(service = exports.service || (exports.service = {}));
var factory;
(function (factory) {
    let asset;
    (function (asset) {
        asset.seatReservation = SeatReservationAssetFactory;
    })(asset = factory.asset || (factory.asset = {}));
    factory.assetGroup = assetGroup_1.default;
    let authorization;
    (function (authorization) {
        authorization.coaSeatReservation = CoaSeatReservationAuthorizationFactory;
        authorization.gmo = GmoAuthorizationFactory;
        authorization.mvtk = MvtkAuthorizationFactory;
    })(authorization = factory.authorization || (factory.authorization = {}));
    factory.authorizationGroup = authorizationGroup_1.default;
    let card;
    (function (card) {
        card.gmo = GMOCardFactory;
    })(card = factory.card || (factory.card = {}));
    let cardId;
    (function (cardId) {
        cardId.gmo = GMOCardIdFactory;
    })(cardId = factory.cardId || (factory.cardId = {}));
    factory.cardGroup = cardGroup_1.default;
    factory.client = ClientFactory;
    factory.clientEvent = ClientEventFactory;
    factory.clientUser = ClientUserFactory;
    factory.film = FilmFactory;
    let notification;
    (function (notification) {
        notification.email = EmailNotificationFactory;
    })(notification = factory.notification || (factory.notification = {}));
    factory.notificationGroup = notificationGroup_1.default;
    let owner;
    (function (owner) {
        owner.anonymous = AnonymousOwnerFactory;
        owner.member = MemberOwnerFactory;
        owner.promoter = PromoterOwnerFactory;
    })(owner = factory.owner || (factory.owner = {}));
    factory.ownerGroup = ownerGroup_1.default;
    factory.ownership = OwnershipFactory;
    factory.performance = PerformanceFactory;
    factory.screen = ScreenFactory;
    let stockStatus;
    (function (stockStatus) {
        // tslint:disable-next-line:no-shadowed-variable
        stockStatus.performance = PerformanceStockStatusFactory;
    })(stockStatus = factory.stockStatus || (factory.stockStatus = {}));
    factory.task = TaskFactory;
    factory.taskExecutionResult = TaskExecutionResultFactory;
    factory.taskName = taskName_1.default;
    factory.taskStatus = taskStatus_1.default;
    factory.theater = TheaterFactory;
    factory.theaterWebsiteGroup = theaterWebsiteGroup_1.default;
    factory.transaction = TransactionFactory;
    let transactionEvent;
    (function (transactionEvent) {
        transactionEvent.addNotification = AddNotificationTransactionEventFactory;
        transactionEvent.authorize = AuthorizeTransactionEventFactory;
        transactionEvent.removeNotification = RemoveNotificationTransactionEventFactory;
        transactionEvent.unauthorize = UnauthorizeTransactionEventFactory;
    })(transactionEvent = factory.transactionEvent || (factory.transactionEvent = {}));
    factory.transactionEventGroup = transactionEventGroup_1.default;
    factory.transactionInquiryKey = TransactionInquiryKeyFactory;
    factory.transactionScope = TransactionScopeFactory;
    factory.transactionStatus = transactionStatus_1.default;
    factory.transactionTasksExportationStatus = transactionTasksExportationStatus_1.default;
})(factory = exports.factory || (exports.factory = {}));
exports.errorCode = errorCode_1.default;
