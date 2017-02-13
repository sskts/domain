import * as mongoose from 'mongoose';

import * as MasterService from './service/master';
import * as NotificationService from './service/notification';
import * as SalesService from './service/sales';
import * as StockService from './service/stock';
import * as TransactionService from './service/transaction';

import OwnerRepository from './repository/interpreter/owner';
import QueueRepository from './repository/interpreter/queue';
import TheaterRepository from './repository/interpreter/theater';
import TransactionRepository from './repository/interpreter/transaction';

import * as AssetFactory from './factory/asset';
import * as AuthorizationFactory from './factory/authorization';
import * as FilmFactory from './factory/film';
import * as NotificationFactory from './factory/notification';
import * as ObjectIdFactory from './factory/objectId';
import * as OwnershipFactory from './factory/ownership';
import * as PerformanceFactory from './factory/performance';
import * as QueueFactory from './factory/queue';
import * as ScreenFactory from './factory/screen';
import * as TheaterFactory from './factory/theater';
import * as TransactionFactory from './factory/transaction';
import * as TransactionEventFactory from './factory/transactionEvent';
import * as TransactionInquiryKeyFactory from './factory/transactionInquiryKey';

/**
 *
 *
 *
 * @param {mongoose.Connection} connection
 * @returns {TheaterRepository}
 */
export function createOwnerRepository(connection: mongoose.Connection): OwnerRepository {
    return new OwnerRepository(connection);
}
export function createQueueRepository(connection: mongoose.Connection): QueueRepository {
    return new QueueRepository(connection);
}
export function createTransactionRepository(connection: mongoose.Connection): TransactionRepository {
    return new TransactionRepository(connection);
}
export function createTheaterRepository(connection: mongoose.Connection): TheaterRepository {
    return new TheaterRepository(connection);
}

export {
    MasterService,
    NotificationService,
    SalesService,
    StockService,
    TransactionService,
    AssetFactory,
    AuthorizationFactory,
    FilmFactory,
    NotificationFactory,
    ObjectIdFactory,
    OwnershipFactory,
    PerformanceFactory,
    QueueFactory,
    ScreenFactory,
    TheaterFactory,
    TransactionFactory,
    TransactionEventFactory,
    TransactionInquiryKeyFactory
}
