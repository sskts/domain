/// <reference types="mongoose" />
import * as mongoose from 'mongoose';
import * as MasterService from './service/master';
import * as NotificationService from './service/notification';
import * as SalesService from './service/sales';
import * as StockService from './service/stock';
import * as TransactionService from './service/transaction';
import AssetRepository from './repository/interpreter/asset';
import FilmRepository from './repository/interpreter/film';
import OwnerRepository from './repository/interpreter/owner';
import PerformanceRepository from './repository/interpreter/performance';
import QueueRepository from './repository/interpreter/queue';
import ScreenRepository from './repository/interpreter/screen';
import TheaterRepository from './repository/interpreter/theater';
import TransactionRepository from './repository/interpreter/transaction';
import Asset from './model/asset';
import Authorization from './model/authorization';
import Notification from './model/notification';
import Ownership from './model/ownership';
import QueueStatus from './model/queueStatus';
import TransactionInquiryKey from './model/transactionInquiryKey';
import TransactionQueuesStatus from './model/transactionQueuesStatus';
import TransactionStatus from './model/transactionStatus';
export declare function createAssetRepository(connection: mongoose.Connection): AssetRepository;
export declare function createFilmRepository(connection: mongoose.Connection): FilmRepository;
/**
 *
 * @param {mongoose.Connection} connection
 * @returns {TheaterRepository}
 */
export declare function createOwnerRepository(connection: mongoose.Connection): OwnerRepository;
export declare function createPerformanceRepository(connection: mongoose.Connection): PerformanceRepository;
export declare function createQueueRepository(connection: mongoose.Connection): QueueRepository;
export declare function createScreenRepository(connection: mongoose.Connection): ScreenRepository;
export declare function createTransactionRepository(connection: mongoose.Connection): TransactionRepository;
export declare function createTheaterRepository(connection: mongoose.Connection): TheaterRepository;
export { Asset, Authorization, MasterService, Notification, NotificationService, Ownership, QueueStatus, SalesService, StockService, TransactionInquiryKey, TransactionQueuesStatus, TransactionStatus, TransactionService };
