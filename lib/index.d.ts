/// <reference types="mongoose" />
/**
 * sskts-domain index module
 * @module
 */
import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as ssktsFactory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import * as redis from 'redis';
import * as ClientService from './service/client';
import * as CreativeWorkService from './service/creativeWork';
import * as EventService from './service/event';
import * as ItemAvailabilityService from './service/itemAvailability';
import * as NotificationService from './service/notification';
import * as OrderService from './service/order';
import * as OrganizationService from './service/organization';
import * as PlaceService from './service/place';
import * as ReportService from './service/report';
import * as SalesService from './service/sales';
import * as ShopService from './service/shop';
import * as StockService from './service/stock';
import * as TaskService from './service/task';
import * as PlaceOrderTransactionService from './service/transaction/placeOrder';
import ClientAdapter from './adapter/client';
import CreativeWorkAdapter from './adapter/creativeWork';
import EventAdapter from './adapter/event';
import GMONotificationAdapter from './adapter/gmoNotification';
import IndividualScreeningEventItemAvailabilityAdapter from './adapter/itemAvailability/individualScreeningEvent';
import OrderAdapter from './adapter/order';
import OrganizationAdapter from './adapter/organization';
import OwnerAdapter from './adapter/owner';
import OwnershipInfoAdapter from './adapter/ownershipInfo';
import PersonAdapter from './adapter/person';
import PlaceAdapter from './adapter/place';
import SendGridEventAdapter from './adapter/sendGridEvent';
import TaskAdapter from './adapter/task';
import TelemetryAdapter from './adapter/telemetry';
import TransactionAdapter from './adapter/transaction';
import TransactionCountAdapter from './adapter/transactionCount';
import ErrorCode from './errorCode';
/**
 * MongoDBクライアント`mongoose`
 *
 * @example
 * var promise = sskts.mongoose.connect('mongodb://localhost/myapp', {
 *     useMongoClient: true
 * });
 */
export import mongoose = mongoose;
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
export import redis = redis;
/**
 * COAのAPIクライアント
 *
 * @example
 * sskts.COA.services.master.theater({ theater_code: '118' }).then(() => {
 *     console.log(result);
 * });
 */
export import COA = COA;
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
export import GMO = GMO;
export declare namespace adapter {
    function transaction(connection: mongoose.Connection): TransactionAdapter;
    function client(connection: mongoose.Connection): ClientAdapter;
    function creativeWork(connection: mongoose.Connection): CreativeWorkAdapter;
    function event(connection: mongoose.Connection): EventAdapter;
    function gmoNotification(connection: mongoose.Connection): GMONotificationAdapter;
    function order(connection: mongoose.Connection): OrderAdapter;
    function organization(connection: mongoose.Connection): OrganizationAdapter;
    function owner(connection: mongoose.Connection): OwnerAdapter;
    function ownershipInfo(connection: mongoose.Connection): OwnershipInfoAdapter;
    function person(connection: mongoose.Connection): PersonAdapter;
    function place(connection: mongoose.Connection): PlaceAdapter;
    namespace itemAvailability {
        function individualScreeningEvent(redisClient: redis.RedisClient): IndividualScreeningEventItemAvailabilityAdapter;
    }
    function sendGridEvent(connection: mongoose.Connection): SendGridEventAdapter;
    function task(connection: mongoose.Connection): TaskAdapter;
    function telemetry(connection: mongoose.Connection): TelemetryAdapter;
    function transactionCount(redisClient: redis.RedisClient): TransactionCountAdapter;
}
export declare namespace service {
    export import client = ClientService;
    export import creativeWork = CreativeWorkService;
    export import event = EventService;
    export import notification = NotificationService;
    export import order = OrderService;
    export import organization = OrganizationService;
    export import place = PlaceService;
    export import report = ReportService;
    export import sales = SalesService;
    export import shop = ShopService;
    export import stock = StockService;
    export import itemAvailability = ItemAvailabilityService;
    export import task = TaskService;
    namespace transaction {
        export import placeOrder = PlaceOrderTransactionService;
    }
}
export import factory = ssktsFactory;
export import errorCode = ErrorCode;
