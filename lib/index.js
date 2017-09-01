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
const EventService = require("./service/event");
const ItemAvailabilityService = require("./service/itemAvailability");
const MasterSyncService = require("./service/masterSync");
const NotificationService = require("./service/notification");
const OrderService = require("./service/order");
const ReportService = require("./service/report");
const SalesService = require("./service/sales");
const StockService = require("./service/stock");
const TaskService = require("./service/task");
const PlaceOrderTransactionService = require("./service/transaction/placeOrder");
const PlaceOrderInProgressTransactionService = require("./service/transaction/placeOrderInProgress");
const client_1 = require("./repo/client");
const creativeWork_1 = require("./repo/creativeWork");
const event_1 = require("./repo/event");
const gmoNotification_1 = require("./repo/gmoNotification");
const individualScreeningEvent_1 = require("./repo/itemAvailability/individualScreeningEvent");
const order_1 = require("./repo/order");
const organization_1 = require("./repo/organization");
const ownershipInfo_1 = require("./repo/ownershipInfo");
const person_1 = require("./repo/person");
const place_1 = require("./repo/place");
const sendGridEvent_1 = require("./repo/sendGridEvent");
const task_1 = require("./repo/task");
const telemetry_1 = require("./repo/telemetry");
const transaction_1 = require("./repo/transaction");
const transactionCount_1 = require("./repo/transactionCount");
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
var repository;
(function (repository) {
    function transaction(connection) {
        return new transaction_1.default(connection);
    }
    repository.transaction = transaction;
    function client(connection) {
        return new client_1.default(connection);
    }
    repository.client = client;
    function creativeWork(connection) {
        return new creativeWork_1.default(connection);
    }
    repository.creativeWork = creativeWork;
    function event(connection) {
        return new event_1.default(connection);
    }
    repository.event = event;
    function gmoNotification(connection) {
        return new gmoNotification_1.default(connection);
    }
    repository.gmoNotification = gmoNotification;
    function order(connection) {
        return new order_1.default(connection);
    }
    repository.order = order;
    function organization(connection) {
        return new organization_1.default(connection);
    }
    repository.organization = organization;
    function ownershipInfo(connection) {
        return new ownershipInfo_1.default(connection);
    }
    repository.ownershipInfo = ownershipInfo;
    function person(connection) {
        return new person_1.default(connection);
    }
    repository.person = person;
    function place(connection) {
        return new place_1.default(connection);
    }
    repository.place = place;
    let itemAvailability;
    (function (itemAvailability) {
        function individualScreeningEvent(redisClient) {
            return new individualScreeningEvent_1.default(redisClient);
        }
        itemAvailability.individualScreeningEvent = individualScreeningEvent;
    })(itemAvailability = repository.itemAvailability || (repository.itemAvailability = {}));
    function sendGridEvent(connection) {
        return new sendGridEvent_1.default(connection);
    }
    repository.sendGridEvent = sendGridEvent;
    function task(connection) {
        return new task_1.default(connection);
    }
    repository.task = task;
    function telemetry(connection) {
        return new telemetry_1.default(connection);
    }
    repository.telemetry = telemetry;
    function transactionCount(redisClient) {
        return new transactionCount_1.default(redisClient);
    }
    repository.transactionCount = transactionCount;
})(repository = exports.repository || (exports.repository = {}));
var service;
(function (service) {
    service.event = EventService;
    service.itemAvailability = ItemAvailabilityService;
    service.masterSync = MasterSyncService;
    service.notification = NotificationService;
    service.order = OrderService;
    service.report = ReportService;
    service.sales = SalesService;
    service.stock = StockService;
    service.task = TaskService;
    let transaction;
    (function (transaction) {
        transaction.placeOrder = PlaceOrderTransactionService;
        transaction.placeOrderInProgress = PlaceOrderInProgressTransactionService;
    })(transaction = service.transaction || (service.transaction = {}));
})(service = exports.service || (exports.service = {}));
exports.factory = ssktsFactory;
