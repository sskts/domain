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
import * as AssetFactory from "./factory/asset";
import * as AuthorizationFactory from "./factory/authorization";
import * as FilmFactory from "./factory/film";
import * as NotificationFactory from "./factory/notification";
import * as ObjectIdFactory from "./factory/objectId";
import * as OwnershipFactory from "./factory/ownership";
import * as PerformanceFactory from "./factory/performance";
import * as QueueFactory from "./factory/queue";
import * as ScreenFactory from "./factory/screen";
import * as TheaterFactory from "./factory/theater";
import * as TransactionFactory from "./factory/transaction";
import * as TransactionEventFactory from "./factory/transactionEvent";
import * as TransactionInquiryKeyFactory from "./factory/transactionInquiryKey";
/**
 *
 *
 *
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
 *
 * @param {mongoose.Connection} connection
 * @returns {TheaterRepository}
 */
export declare function createOwnerRepository(connection: mongoose.Connection): OwnerRepository;
export declare function createQueueRepository(connection: mongoose.Connection): QueueRepository;
export declare function createTransactionRepository(connection: mongoose.Connection): TransactionRepository;
export declare function createTheaterRepository(connection: mongoose.Connection): TheaterRepository;
export { AssetFactory, AuthorizationFactory, FilmFactory, NotificationFactory, ObjectIdFactory, OwnershipFactory, PerformanceFactory, QueueFactory, ScreenFactory, TheaterFactory, TransactionFactory, TransactionEventFactory, TransactionInquiryKeyFactory };
