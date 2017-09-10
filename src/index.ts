// tslint:disable:max-classes-per-file

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
import * as OwnershipInfoService from './service/ownershipInfo';
import * as ReportService from './service/report';
import * as SalesService from './service/sales';
import * as StockService from './service/stock';
import * as TaskService from './service/task';
import * as PlaceOrderTransactionService from './service/transaction/placeOrder';
import * as PlaceOrderInProgressTransactionService from './service/transaction/placeOrderInProgress';

import { MongoRepository as ActionRepository } from './repo/action';
import { MongoRepository as ClientRepository } from './repo/client';
import { MongoRepository as CreativeWorkRepository } from './repo/creativeWork';
import { MongoRepository as EventRepository } from './repo/event';
import { MongoRepository as GMONotificationRepository } from './repo/gmoNotification';
import { MongoRepository as IndividualScreeningEventItemAvailabilityRepository } from './repo/itemAvailability/individualScreeningEvent';
import { MongoRepository as OrderRepository } from './repo/order';
import { MongoRepository as OrganizationRepository } from './repo/organization';
import { MongoRepository as OwnershipInfoRepository } from './repo/ownershipInfo';
import { MongoRepository as PersonRepository } from './repo/person';
import { MongoRepository as PlaceRepository } from './repo/place';
import { MongoRepository as SendGridEventRepository } from './repo/sendGridEvent';
import { MongoRepository as TaskRepository } from './repo/task';
import { MongoRepository as TelemetryRepository } from './repo/telemetry';
import { MongoRepository as TransactionRepository } from './repo/transaction';
import { MongoRepository as TransactionCountRepository } from './repo/transactionCount';

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
    export class Action extends ActionRepository { }
    export class Client extends ClientRepository { }
    export class CreativeWork extends CreativeWorkRepository { }
    export class Event extends EventRepository { }
    export class GMONotification extends GMONotificationRepository { }
    export class Order extends OrderRepository { }
    export class Organization extends OrganizationRepository { }
    export class OwnershipInfo extends OwnershipInfoRepository { }
    export class Person extends PersonRepository { }
    export class Place extends PlaceRepository { }
    export class SendGridEvent extends SendGridEventRepository { }
    export class Task extends TaskRepository { }
    export class Telemetry extends TelemetryRepository { }
    export class Transaction extends TransactionRepository { }
    export class TransactionCount extends TransactionCountRepository { }

    export namespace itemAvailability {
        export class IndividualScreeningEvent extends IndividualScreeningEventItemAvailabilityRepository { }
    }
}

export namespace service {
    export import event = EventService;
    export import itemAvailability = ItemAvailabilityService;
    export import masterSync = MasterSyncService;
    export import notification = NotificationService;
    export import order = OrderService;
    export import ownershipInfo = OwnershipInfoService;
    export import report = ReportService;
    export import sales = SalesService;
    export import stock = StockService;
    export import task = TaskService;
    export namespace transaction {
        export import placeOrder = PlaceOrderTransactionService;
        export import placeOrderInProgress = PlaceOrderInProgressTransactionService;
    }
}

export import factory = ssktsFactory;
