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
import ClientRepository from './repository/client';
import CreativeWorkRepository from './repository/creativeWork';
import EventRepository from './repository/event';
import GMONotificationRepository from './repository/gmoNotification';
import IndividualScreeningEventItemAvailabilityRepository from './repository/itemAvailability/individualScreeningEvent';
import OrderRepository from './repository/order';
import OrganizationRepository from './repository/organization';
import OwnershipInfoRepository from './repository/ownershipInfo';
import PersonRepository from './repository/person';
import PlaceRepository from './repository/place';
import SendGridEventRepository from './repository/sendGridEvent';
import TaskRepository from './repository/task';
import TelemetryRepository from './repository/telemetry';
import TransactionRepository from './repository/transaction';
import TransactionCountRepository from './repository/transactionCount';
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
export declare namespace repository {
    function transaction(connection: mongoose.Connection): TransactionRepository;
    function client(connection: mongoose.Connection): ClientRepository;
    function creativeWork(connection: mongoose.Connection): CreativeWorkRepository;
    function event(connection: mongoose.Connection): EventRepository;
    function gmoNotification(connection: mongoose.Connection): GMONotificationRepository;
    function order(connection: mongoose.Connection): OrderRepository;
    function organization(connection: mongoose.Connection): OrganizationRepository;
    function ownershipInfo(connection: mongoose.Connection): OwnershipInfoRepository;
    function person(connection: mongoose.Connection): PersonRepository;
    function place(connection: mongoose.Connection): PlaceRepository;
    namespace itemAvailability {
        function individualScreeningEvent(redisClient: redis.RedisClient): IndividualScreeningEventItemAvailabilityRepository;
    }
    function sendGridEvent(connection: mongoose.Connection): SendGridEventRepository;
    function task(connection: mongoose.Connection): TaskRepository;
    function telemetry(connection: mongoose.Connection): TelemetryRepository;
    function transactionCount(redisClient: redis.RedisClient): TransactionCountRepository;
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
