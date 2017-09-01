/**
 * sskts-domain index module
 * @module
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as ssktsFactory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import * as redis from 'redis';

import * as EventService from './service/event';
import * as ItemAvailabilityService from './service/itemAvailability';
import * as MasterSyncService from './service/masterSync';
import * as NotificationService from './service/notification';
import * as OrderService from './service/order';
import * as ReportService from './service/report';
import * as SalesService from './service/sales';
import * as StockService from './service/stock';
import * as TaskService from './service/task';
import * as PlaceOrderTransactionService from './service/transaction/placeOrder';

import ClientRepository from './repo/client';
import CreativeWorkRepository from './repo/creativeWork';
import EventRepository from './repo/event';
import GMONotificationRepository from './repo/gmoNotification';
import IndividualScreeningEventItemAvailabilityRepository from './repo/itemAvailability/individualScreeningEvent';
import OrderRepository from './repo/order';
import OrganizationRepository from './repo/organization';
import OwnershipInfoRepository from './repo/ownershipInfo';
import PersonRepository from './repo/person';
import PlaceRepository from './repo/place';
import SendGridEventRepository from './repo/sendGridEvent';
import TaskRepository from './repo/task';
import TelemetryRepository from './repo/telemetry';
import TransactionRepository from './repo/transaction';
import TransactionCountRepository from './repo/transactionCount';

(<any>mongoose).Promise = global.Promise;

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

export namespace repository {
    export function transaction(connection: mongoose.Connection) {
        return new TransactionRepository(connection);
    }
    export function client(connection: mongoose.Connection) {
        return new ClientRepository(connection);
    }
    export function creativeWork(connection: mongoose.Connection) {
        return new CreativeWorkRepository(connection);
    }
    export function event(connection: mongoose.Connection) {
        return new EventRepository(connection);
    }
    export function gmoNotification(connection: mongoose.Connection) {
        return new GMONotificationRepository(connection);
    }
    export function order(connection: mongoose.Connection) {
        return new OrderRepository(connection);
    }
    export function organization(connection: mongoose.Connection) {
        return new OrganizationRepository(connection);
    }
    export function ownershipInfo(connection: mongoose.Connection) {
        return new OwnershipInfoRepository(connection);
    }
    export function person(connection: mongoose.Connection) {
        return new PersonRepository(connection);
    }
    export function place(connection: mongoose.Connection) {
        return new PlaceRepository(connection);
    }
    export namespace itemAvailability {
        export function individualScreeningEvent(redisClient: redis.RedisClient) {
            return new IndividualScreeningEventItemAvailabilityRepository(redisClient);
        }
    }
    export function sendGridEvent(connection: mongoose.Connection) {
        return new SendGridEventRepository(connection);
    }
    export function task(connection: mongoose.Connection) {
        return new TaskRepository(connection);
    }
    export function telemetry(connection: mongoose.Connection) {
        return new TelemetryRepository(connection);
    }
    export function transactionCount(redisClient: redis.RedisClient) {
        return new TransactionCountRepository(redisClient);
    }
}

export namespace service {
    export import event = EventService;
    export import itemAvailability = ItemAvailabilityService;
    export import masterSync = MasterSyncService;
    export import notification = NotificationService;
    export import order = OrderService;
    export import report = ReportService;
    export import sales = SalesService;
    export import stock = StockService;
    export import task = TaskService;
    export namespace transaction {
        export import placeOrder = PlaceOrderTransactionService;
    }
}

export import factory = ssktsFactory;
