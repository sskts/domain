/// <reference types="mongoose" />
import mongoose = require("mongoose");
import MasterService from "./service/interpreter/master";
import NotificationService from "./service/interpreter/notification";
import SalesService from "./service/interpreter/sales";
import StockService from "./service/interpreter/stock";
import TransactionService from "./service/interpreter/transaction";
import OwnerRepository from "./repository/interpreter/owner";
import QueueRepository from "./repository/interpreter/queue";
import TheaterRepository from "./repository/interpreter/theater";
import TransactionRepository from "./repository/interpreter/transaction";
import AssetFactory from "./factory/asset";
import AuthorizationFactory from "./factory/authorization";
import FilmFactory from "./factory/film";
import NotificationFactory from "./factory/notification";
import ObjectIdFactory from "./factory/objectId";
import OwnershipFactory from "./factory/ownership";
import PerformanceFactory from "./factory/performance";
import QueueFactory from "./factory/queue";
import ScreenFactory from "./factory/screen";
import TheaterFactory from "./factory/theater";
import TransactionFactory from "./factory/transaction";
import TransactionEventFactory from "./factory/transactionEvent";
import TransactionInquiryKeyFactory from "./factory/transactionInquiryKey";
/**
 *
 *
 * @export
 * @returns {MasterService}
 */
export declare function createMasterService(): MasterService;
export declare function createTransactionService(): TransactionService;
export declare function createStockService(): StockService;
export declare function createSalesService(): SalesService;
export declare function createNotificationService(): NotificationService;
/**
 *
 *
 * @export
 * @param {mongoose.Connection} connection
 * @returns {TheaterRepository}
 */
export declare function createOwnerRepository(connection: mongoose.Connection): OwnerRepository;
export declare function createQueueRepository(connection: mongoose.Connection): QueueRepository;
export declare function createTransactionRepository(connection: mongoose.Connection): TransactionRepository;
export declare function createTheaterRepository(connection: mongoose.Connection): TheaterRepository;
export { AssetFactory, AuthorizationFactory, FilmFactory, NotificationFactory, ObjectIdFactory, OwnershipFactory, PerformanceFactory, QueueFactory, ScreenFactory, TheaterFactory, TransactionFactory, TransactionEventFactory, TransactionInquiryKeyFactory };
