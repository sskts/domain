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
const CreativeWorkService = require("./service/creativeWork");
const EventService = require("./service/event");
const NotificationService = require("./service/notification");
const OrderService = require("./service/order");
const OrganizationService = require("./service/organization");
const PlaceService = require("./service/place");
const ReportService = require("./service/report");
const SalesService = require("./service/sales");
const ShopService = require("./service/shop");
const StockService = require("./service/stock");
const StockStatusService = require("./service/stockStatus");
const TaskService = require("./service/task");
const PlaceOrderTransactionService = require("./service/transaction/placeOrder");
const client_1 = require("./adapter/client");
const creativeWork_1 = require("./adapter/creativeWork");
const event_1 = require("./adapter/event");
const gmoNotification_1 = require("./adapter/gmoNotification");
const order_1 = require("./adapter/order");
const organization_1 = require("./adapter/organization");
const owner_1 = require("./adapter/owner");
const ownershipInfo_1 = require("./adapter/ownershipInfo");
const person_1 = require("./adapter/person");
const place_1 = require("./adapter/place");
const sendGridEvent_1 = require("./adapter/sendGridEvent");
const performance_1 = require("./adapter/stockStatus/performance");
const task_1 = require("./adapter/task");
const telemetry_1 = require("./adapter/telemetry");
const transaction_1 = require("./adapter/transaction");
const transactionCount_1 = require("./adapter/transactionCount");
const GMOAuthorizationFactory = require("./factory/authorization/gmo");
const MvtkAuthorizationFactory = require("./factory/authorization/mvtk");
const seatReservationAuthorizationFactory = require("./factory/authorization/seatReservation");
const authorizationGroup_1 = require("./factory/authorizationGroup");
const GMOCardFactory = require("./factory/card/gmo");
const cardGroup_1 = require("./factory/cardGroup");
const GMOCardIdFactory = require("./factory/cardId/gmo");
const ClientFactory = require("./factory/client");
const ClientEventFactory = require("./factory/clientEvent");
const ClientUserFactory = require("./factory/clientUser");
const IndividualScreeningEventFactory = require("./factory/event/individualScreeningEvent");
const ScreeningEventFactory = require("./factory/event/screeningEvent");
const eventType_1 = require("./factory/eventType");
const EmailNotificationFactory = require("./factory/notification/email");
const notificationGroup_1 = require("./factory/notificationGroup");
const OrderFactory = require("./factory/order");
const OrderInquiryKeyFactory = require("./factory/orderInquiryKey");
const CorporationOrganizationFactory = require("./factory/organization/corporation");
const MovieTheaterOrganizationFactory = require("./factory/organization/movieTheater");
const corporation_1 = require("./factory/organizationIdentifier/corporation");
const organizationType_1 = require("./factory/organizationType");
const MovieTheaterPlaceFactory = require("./factory/place/movieTheater");
const reservationStatusType_1 = require("./factory/reservationStatusType");
const PerformanceStockStatusFactory = require("./factory/stockStatus/performance");
const TaskFactory = require("./factory/task");
const TaskExecutionResultFactory = require("./factory/taskExecutionResult");
const taskName_1 = require("./factory/taskName");
const taskStatus_1 = require("./factory/taskStatus");
const TransactionFactory = require("./factory/transaction");
const TransactionScopeFactory = require("./factory/transactionScope");
const transactionStatusType_1 = require("./factory/transactionStatusType");
const transactionTasksExportationStatus_1 = require("./factory/transactionTasksExportationStatus");
const URLFactory = require("./factory/url");
const errorCode_1 = require("./errorCode");
mongoose.Promise = global.Promise;
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
    function transaction(connection) {
        return new transaction_1.default(connection);
    }
    adapter.transaction = transaction;
    function client(connection) {
        return new client_1.default(connection);
    }
    adapter.client = client;
    function creativeWork(connection) {
        return new creativeWork_1.default(connection);
    }
    adapter.creativeWork = creativeWork;
    function event(connection) {
        return new event_1.default(connection);
    }
    adapter.event = event;
    function gmoNotification(connection) {
        return new gmoNotification_1.default(connection);
    }
    adapter.gmoNotification = gmoNotification;
    function order(connection) {
        return new order_1.default(connection);
    }
    adapter.order = order;
    function organization(connection) {
        return new organization_1.default(connection);
    }
    adapter.organization = organization;
    function owner(connection) {
        return new owner_1.default(connection);
    }
    adapter.owner = owner;
    function ownershipInfo(connection) {
        return new ownershipInfo_1.default(connection);
    }
    adapter.ownershipInfo = ownershipInfo;
    function person(connection) {
        return new person_1.default(connection);
    }
    adapter.person = person;
    function place(connection) {
        return new place_1.default(connection);
    }
    adapter.place = place;
    let stockStatus;
    (function (stockStatus) {
        // tslint:disable-next-line:no-shadowed-variable
        function performance(redisClient) {
            return new performance_1.default(redisClient);
        }
        stockStatus.performance = performance;
    })(stockStatus = adapter.stockStatus || (adapter.stockStatus = {}));
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
    function transactionCount(redisClient) {
        return new transactionCount_1.default(redisClient);
    }
    adapter.transactionCount = transactionCount;
})(adapter = exports.adapter || (exports.adapter = {}));
var service;
(function (service) {
    service.client = ClientService;
    service.creativeWork = CreativeWorkService;
    service.event = EventService;
    service.notification = NotificationService;
    service.order = OrderService;
    service.organization = OrganizationService;
    service.place = PlaceService;
    service.report = ReportService;
    service.sales = SalesService;
    service.shop = ShopService;
    service.stock = StockService;
    service.stockStatus = StockStatusService;
    service.task = TaskService;
    let transaction;
    (function (transaction) {
        transaction.placeOrder = PlaceOrderTransactionService;
    })(transaction = service.transaction || (service.transaction = {}));
})(service = exports.service || (exports.service = {}));
var factory;
(function (factory) {
    let authorization;
    (function (authorization) {
        authorization.gmo = GMOAuthorizationFactory;
        authorization.mvtk = MvtkAuthorizationFactory;
        authorization.seatReservation = seatReservationAuthorizationFactory;
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
    let notification;
    (function (notification) {
        notification.email = EmailNotificationFactory;
    })(notification = factory.notification || (factory.notification = {}));
    let event;
    (function (event) {
        event.individualScreeningEvent = IndividualScreeningEventFactory;
        event.screeningEvent = ScreeningEventFactory;
    })(event = factory.event || (factory.event = {}));
    factory.eventType = eventType_1.default;
    factory.notificationGroup = notificationGroup_1.default;
    factory.order = OrderFactory;
    factory.orderInquiryKey = OrderInquiryKeyFactory;
    let organization;
    (function (organization) {
        organization.corporation = CorporationOrganizationFactory;
        organization.movieTheater = MovieTheaterOrganizationFactory;
    })(organization = factory.organization || (factory.organization = {}));
    let organizationIdentifier;
    (function (organizationIdentifier) {
        organizationIdentifier.corporation = corporation_1.default;
    })(organizationIdentifier = factory.organizationIdentifier || (factory.organizationIdentifier = {}));
    factory.organizationType = organizationType_1.default;
    let place;
    (function (place) {
        place.movieTheater = MovieTheaterPlaceFactory;
    })(place = factory.place || (factory.place = {}));
    factory.reservationStatusType = reservationStatusType_1.default;
    let stockStatus;
    (function (stockStatus) {
        // tslint:disable-next-line:no-shadowed-variable
        stockStatus.performance = PerformanceStockStatusFactory;
    })(stockStatus = factory.stockStatus || (factory.stockStatus = {}));
    factory.task = TaskFactory;
    factory.taskExecutionResult = TaskExecutionResultFactory;
    factory.taskName = taskName_1.default;
    factory.taskStatus = taskStatus_1.default;
    factory.transaction = TransactionFactory;
    factory.transactionScope = TransactionScopeFactory;
    factory.transactionStatusType = transactionStatusType_1.default;
    factory.transactionTasksExportationStatus = transactionTasksExportationStatus_1.default;
    factory.url = URLFactory;
})(factory = exports.factory || (exports.factory = {}));
exports.errorCode = errorCode_1.default;
