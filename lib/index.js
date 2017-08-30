"use strict";
/**
 * sskts-domain index module
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const ssktsFactory = require("@motionpicture/sskts-factory");
const mongoose = require("mongoose");
const redis = require("redis");
const ClientService = require("./service/client");
const CreativeWorkService = require("./service/creativeWork");
const EventService = require("./service/event");
const ItemAvailabilityService = require("./service/itemAvailability");
const NotificationService = require("./service/notification");
const OrderService = require("./service/order");
const OrganizationService = require("./service/organization");
const PlaceService = require("./service/place");
const ReportService = require("./service/report");
const SalesService = require("./service/sales");
const ShopService = require("./service/shop");
const StockService = require("./service/stock");
const TaskService = require("./service/task");
const PlaceOrderTransactionService = require("./service/transaction/placeOrder");
const client_1 = require("./adapter/client");
const creativeWork_1 = require("./adapter/creativeWork");
const event_1 = require("./adapter/event");
const gmoNotification_1 = require("./adapter/gmoNotification");
const individualScreeningEvent_1 = require("./adapter/itemAvailability/individualScreeningEvent");
const order_1 = require("./adapter/order");
const organization_1 = require("./adapter/organization");
const ownershipInfo_1 = require("./adapter/ownershipInfo");
const person_1 = require("./adapter/person");
const place_1 = require("./adapter/place");
const sendGridEvent_1 = require("./adapter/sendGridEvent");
const task_1 = require("./adapter/task");
const telemetry_1 = require("./adapter/telemetry");
const transaction_1 = require("./adapter/transaction");
const transactionCount_1 = require("./adapter/transactionCount");
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
    let itemAvailability;
    (function (itemAvailability) {
        function individualScreeningEvent(redisClient) {
            return new individualScreeningEvent_1.default(redisClient);
        }
        itemAvailability.individualScreeningEvent = individualScreeningEvent;
    })(itemAvailability = adapter.itemAvailability || (adapter.itemAvailability = {}));
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
    service.itemAvailability = ItemAvailabilityService;
    service.task = TaskService;
    let transaction;
    (function (transaction) {
        transaction.placeOrder = PlaceOrderTransactionService;
    })(transaction = service.transaction || (service.transaction = {}));
})(service = exports.service || (exports.service = {}));
exports.factory = ssktsFactory;
