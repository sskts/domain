/// <reference types="mongoose" />
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
export declare function createAssetAdapter(connection: Connection): AssetAdapter;
export declare function createFilmAdapter(connection: Connection): FilmAdapter;
export declare function createOwnerAdapter(connection: Connection): OwnerAdapter;
export declare function createPerformanceAdapter(connection: Connection): PerformanceAdapter;
export declare function createQueueAdapter(connection: Connection): QueueAdapter;
export declare function createScreenAdapter(connection: Connection): ScreenAdapter;
export declare function createTransactionAdapter(connection: Connection): TransactionAdapter;
export declare function createTheaterAdapter(connection: Connection): TheaterAdapter;
export declare const service: {
    master: typeof masterService;
    notification: typeof notificationService;
    sales: typeof salesService;
    stock: typeof stockService;
    transaction: typeof transactionService;
};
export declare const factory: {
    asset: typeof asset;
    authorization: typeof authorization;
    notification: typeof notification;
    owner: typeof owner;
    ownership: typeof ownership;
    queueStatus: typeof queueStatus;
    transactionInquiryKey: typeof transactionInquiryKey;
    transactionQueuesStatus: typeof transactionQueuesStatus;
    transactionStatus: typeof transactionStatus;
};
