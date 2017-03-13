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

import AssetAdapter from './adapter/asset';
import FilmAdapter from './adapter/film';
import OwnerAdapter from './adapter/owner';
import PerformanceAdapter from './adapter/performance';
import QueueAdapter from './adapter/queue';
import ScreenAdapter from './adapter/screen';
import TheaterAdapter from './adapter/theater';
import TransactionAdapter from './adapter/transaction';

import * as asset from './factory/asset';
import * as authorization from './factory/authorization';
import * as notification from './factory/notification';
import * as owner from './factory/owner';
import * as ownership from './factory/ownership';
import queueStatus from './factory/queueStatus';
import * as transactionInquiryKey from './factory/transactionInquiryKey';
import transactionQueuesStatus from './factory/transactionQueuesStatus';
import transactionStatus from './factory/transactionStatus';

export function createAssetAdapter(connection: Connection) {
    return new AssetAdapter(connection);
}
export function createFilmAdapter(connection: Connection) {
    return new FilmAdapter(connection);
}
export function createOwnerAdapter(connection: Connection) {
    return new OwnerAdapter(connection);
}
export function createPerformanceAdapter(connection: Connection) {
    return new PerformanceAdapter(connection);
}
export function createQueueAdapter(connection: Connection) {
    return new QueueAdapter(connection);
}
export function createScreenAdapter(connection: Connection) {
    return new ScreenAdapter(connection);
}
export function createTransactionAdapter(connection: Connection) {
    return new TransactionAdapter(connection);
}
export function createTheaterAdapter(connection: Connection) {
    return new TheaterAdapter(connection);
}

export const service = {
    master: masterService,
    notification: notificationService,
    sales: salesService,
    stock: stockService,
    transaction: transactionService
};

export const factory = {
    asset,
    authorization,
    notification,
    owner,
    ownership,
    queueStatus,
    transactionInquiryKey,
    transactionQueuesStatus,
    transactionStatus
};
