"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * sskts-domain index module
 * @module
 */
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
const OwnershipInfoService = require("./service/ownershipInfo");
const PersonContactService = require("./service/person/contact");
const PersonCreditCardService = require("./service/person/creditCard");
const ReportService = require("./service/report");
const SalesService = require("./service/sales");
const StockService = require("./service/stock");
const TaskService = require("./service/task");
const PlaceOrderTransactionService = require("./service/transaction/placeOrder");
const PlaceOrderInProgressTransactionService = require("./service/transaction/placeOrderInProgress");
const UtilService = require("./service/util");
const authorize_1 = require("./repo/action/authorize");
const print_1 = require("./repo/action/print");
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
    let action;
    (function (action) {
        class Authorize extends authorize_1.MongoRepository {
        }
        action.Authorize = Authorize;
        class Print extends print_1.MongoRepository {
        }
        action.Print = Print;
    })(action = repository.action || (repository.action = {}));
    class Client extends client_1.MongoRepository {
    }
    repository.Client = Client;
    class CreativeWork extends creativeWork_1.MongoRepository {
    }
    repository.CreativeWork = CreativeWork;
    class Event extends event_1.MongoRepository {
    }
    repository.Event = Event;
    class GMONotification extends gmoNotification_1.MongoRepository {
    }
    repository.GMONotification = GMONotification;
    class Order extends order_1.MongoRepository {
    }
    repository.Order = Order;
    class Organization extends organization_1.MongoRepository {
    }
    repository.Organization = Organization;
    class OwnershipInfo extends ownershipInfo_1.MongoRepository {
    }
    repository.OwnershipInfo = OwnershipInfo;
    class Person extends person_1.MongoRepository {
    }
    repository.Person = Person;
    class Place extends place_1.MongoRepository {
    }
    repository.Place = Place;
    class SendGridEvent extends sendGridEvent_1.MongoRepository {
    }
    repository.SendGridEvent = SendGridEvent;
    class Task extends task_1.MongoRepository {
    }
    repository.Task = Task;
    class Telemetry extends telemetry_1.MongoRepository {
    }
    repository.Telemetry = Telemetry;
    class Transaction extends transaction_1.MongoRepository {
    }
    repository.Transaction = Transaction;
    class TransactionCount extends transactionCount_1.MongoRepository {
    }
    repository.TransactionCount = TransactionCount;
    let itemAvailability;
    (function (itemAvailability) {
        class IndividualScreeningEvent extends individualScreeningEvent_1.MongoRepository {
        }
        itemAvailability.IndividualScreeningEvent = IndividualScreeningEvent;
    })(itemAvailability = repository.itemAvailability || (repository.itemAvailability = {}));
})(repository = exports.repository || (exports.repository = {}));
var service;
(function (service) {
    service.event = EventService;
    service.itemAvailability = ItemAvailabilityService;
    service.masterSync = MasterSyncService;
    service.notification = NotificationService;
    service.order = OrderService;
    service.ownershipInfo = OwnershipInfoService;
    let person;
    (function (person) {
        person.contact = PersonContactService;
        person.creditCard = PersonCreditCardService;
    })(person = service.person || (service.person = {}));
    service.report = ReportService;
    service.sales = SalesService;
    service.stock = StockService;
    service.task = TaskService;
    let transaction;
    (function (transaction) {
        transaction.placeOrder = PlaceOrderTransactionService;
        transaction.placeOrderInProgress = PlaceOrderInProgressTransactionService;
    })(transaction = service.transaction || (service.transaction = {}));
    service.util = UtilService;
})(service = exports.service || (exports.service = {}));
exports.factory = ssktsFactory;
