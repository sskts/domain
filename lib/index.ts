/**
 * sskts-domainモジュール
 *
 * @module
 */
import { Connection } from 'mongoose';

import * as masterService from './service/master';
import * as notificationService from './service/notification';
import * as salesService from './service/sales';
import * as stockService from './service/stock';
import * as transactionService from './service/transaction';

import AssetRepository from './repository/interpreter/asset';
import FilmRepository from './repository/interpreter/film';
import OwnerRepository from './repository/interpreter/owner';
import PerformanceRepository from './repository/interpreter/performance';
import QueueRepository from './repository/interpreter/queue';
import ScreenRepository from './repository/interpreter/screen';
import TheaterRepository from './repository/interpreter/theater';
import TransactionRepository from './repository/interpreter/transaction';

import * as Asset from './model/asset';
import * as Authorization from './model/authorization';
import * as Notification from './model/notification';
import * as Ownership from './model/ownership';
import QueueStatus from './model/queueStatus';
import * as TransactionInquiryKey from './model/transactionInquiryKey';
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

export const service = {
    master: masterService,
    notification: notificationService,
    sales: salesService,
    stock: stockService,
    transaction: transactionService
};

export const model = {
    Asset,
    Authorization,
    Notification,
    Ownership,
    QueueStatus,
    TransactionInquiryKey,
    TransactionQueuesStatus,
    TransactionStatus
};
