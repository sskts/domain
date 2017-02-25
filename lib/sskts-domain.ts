/**
 * sskts-domainモジュール
 *
 * @module
 */
import { Connection } from 'mongoose';

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

export function createAssetRepository(connection: Connection) {
    return new AssetRepository(connection);
}
export function createFilmRepository(connection: Connection) {
    return new FilmRepository(connection);
}
export function createOwnerRepository(connection: Connection) {
    return new OwnerRepository(connection);
}
export function createPerformanceRepository(connection: Connection) {
    return new PerformanceRepository(connection);
}
export function createQueueRepository(connection: Connection) {
    return new QueueRepository(connection);
}
export function createScreenRepository(connection: Connection) {
    return new ScreenRepository(connection);
}
export function createTransactionRepository(connection: Connection) {
    return new TransactionRepository(connection);
}
export function createTheaterRepository(connection: Connection) {
    return new TheaterRepository(connection);
}

export {
    Asset,
    Authorization,
    MasterService,
    Notification,
    NotificationService,
    Ownership,
    QueueStatus,
    SalesService,
    StockService,
    TransactionInquiryKey,
    TransactionQueuesStatus,
    TransactionStatus,
    TransactionService
}
