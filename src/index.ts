// tslint:disable:max-classes-per-file completed-docs

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
import * as PersonContactService from './service/person/contact';
import * as PersonCreditCardService from './service/person/creditCard';
import * as ReportService from './service/report';
import * as SalesService from './service/sales';
import * as StockService from './service/stock';
import * as TaskService from './service/task';
import * as PlaceOrderTransactionService from './service/transaction/placeOrder';
import * as PlaceOrderInProgressTransactionService from './service/transaction/placeOrderInProgress';
import * as ReturnOrderTransactionService from './service/transaction/returnOrder';
import * as UtilService from './service/util';

import { MongoRepository as ActionRepo } from './repo/action';
import { MongoRepository as AuthorizeActionRepo } from './repo/action/authorize';
import { MongoRepository as CreditCardAuthorizeActionRepo } from './repo/action/authorize/creditCard';
import { MongoRepository as MvtkAuthorizeActionRepo } from './repo/action/authorize/mvtk';
import { MongoRepository as SeatReservationAuthorizeActionRepo } from './repo/action/authorize/seatReservation';
import { MongoRepository as PrintActionRepo } from './repo/action/print';
import { MongoRepository as ClientRepo } from './repo/client';
import { MongoRepository as CreativeWorkRepo } from './repo/creativeWork';
import { MongoRepository as EventRepo } from './repo/event';
import { MongoRepository as GMONotificationRepo } from './repo/gmoNotification';
import { MongoRepository as IndividualScreeningEventItemAvailabilityRepo } from './repo/itemAvailability/individualScreeningEvent';
import { MongoRepository as OrderRepo } from './repo/order';
import { MongoRepository as OrganizationRepo } from './repo/organization';
import { MongoRepository as OwnershipInfoRepo } from './repo/ownershipInfo';
import { MongoRepository as PlaceRepo } from './repo/place';
import { MongoRepository as SendGridEventRepo } from './repo/sendGridEvent';
import { MongoRepository as TaskRepo } from './repo/task';
import { MongoRepository as TelemetryRepo } from './repo/telemetry';
import { MongoRepository as TransactionRepo } from './repo/transaction';
import { MongoRepository as TransactionCountRepo } from './repo/transactionCount';

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
    export class Action extends ActionRepo { }
    export namespace action {
        export class Authorize extends AuthorizeActionRepo { }
        export namespace authorize {
            export class CreditCard extends CreditCardAuthorizeActionRepo { }
            export class Mvtk extends MvtkAuthorizeActionRepo { }
            export class SeatReservation extends SeatReservationAuthorizeActionRepo { }
        }
        export class Print extends PrintActionRepo { }
    }
    export class Client extends ClientRepo { }
    export class CreativeWork extends CreativeWorkRepo { }
    export class Event extends EventRepo { }
    export class GMONotification extends GMONotificationRepo { }
    export class Order extends OrderRepo { }
    export class Organization extends OrganizationRepo { }
    export class OwnershipInfo extends OwnershipInfoRepo { }
    export class Place extends PlaceRepo { }
    export class SendGridEvent extends SendGridEventRepo { }
    export class Task extends TaskRepo { }
    export class Telemetry extends TelemetryRepo { }
    export class Transaction extends TransactionRepo { }
    export class TransactionCount extends TransactionCountRepo { }

    export namespace itemAvailability {
        export class IndividualScreeningEvent extends IndividualScreeningEventItemAvailabilityRepo { }
    }
}

export namespace service {
    export import event = EventService;
    export import itemAvailability = ItemAvailabilityService;
    export import masterSync = MasterSyncService;
    export import notification = NotificationService;
    export import order = OrderService;
    export import ownershipInfo = OwnershipInfoService;
    export namespace person {
        export import contact = PersonContactService;
        export import creditCard = PersonCreditCardService;
    }
    export import report = ReportService;
    export import sales = SalesService;
    export import stock = StockService;
    export import task = TaskService;
    export namespace transaction {
        export import placeOrder = PlaceOrderTransactionService;
        export import placeOrderInProgress = PlaceOrderInProgressTransactionService;
        export import returnOrder = ReturnOrderTransactionService;
    }
    export import util = UtilService;
}

export import factory = ssktsFactory;
