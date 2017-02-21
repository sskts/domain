import * as mongoose from 'mongoose';

import * as MasterService from './service/master';
import * as NotificationService from './service/notification';
import * as SalesService from './service/sales';
import * as StockService from './service/stock';
import * as TransactionService from './service/transaction';

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
import TransactionInquiryKey from './model/transactionInquiryKey';

export function createFilmRepository(connection: mongoose.Connection) {
    return new FilmRepository(connection);
}
/**
 *
 * @param {mongoose.Connection} connection
 * @returns {TheaterRepository}
 */
export function createOwnerRepository(connection: mongoose.Connection) {
    return new OwnerRepository(connection);
}
export function createPerformanceRepository(connection: mongoose.Connection) {
    return new PerformanceRepository(connection);
}
export function createQueueRepository(connection: mongoose.Connection) {
    return new QueueRepository(connection);
}
export function createScreenRepository(connection: mongoose.Connection) {
    return new ScreenRepository(connection);
}
export function createTransactionRepository(connection: mongoose.Connection) {
    return new TransactionRepository(connection);
}
export function createTheaterRepository(connection: mongoose.Connection) {
    return new TheaterRepository(connection);
}

export {
    Asset,
    Authorization,
    MasterService,
    Notification,
    NotificationService,
    Ownership,
    SalesService,
    StockService,
    TransactionInquiryKey,
    TransactionService
}
