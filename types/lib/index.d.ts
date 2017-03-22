/// <reference types="mongoose" />
/**
 * sskts-domainモジュール
 *
 * @module
 */
import { Connection } from 'mongoose';
import * as masterService from './service/master';
import * as notificationService from './service/notification';
import * as queueService from './service/queue';
import * as reportService from './service/report';
import * as salesService from './service/sales';
import * as stockService from './service/stock';
import * as transactionService from './service/transaction';
import * as transactionWithIdService from './service/transactionWithId';
import AssetAdapter from './adapter/asset';
import FilmAdapter from './adapter/film';
import OwnerAdapter from './adapter/owner';
import PerformanceAdapter from './adapter/performance';
import QueueAdapter from './adapter/queue';
import ScreenAdapter from './adapter/screen';
import TheaterAdapter from './adapter/theater';
import TransactionAdapter from './adapter/transaction';
import * as asset from './factory/asset';
import assetGroup from './factory/assetGroup';
import * as coaSeatReservationAuthorization from './factory/authorization/coaSeatReservation';
import * as gmoAuthorization from './factory/authorization/gmo';
import * as mvtkAuthorization from './factory/authorization/mvtk';
import authorizationGroup from './factory/authorizationGroup';
import * as film from './factory/film';
import * as notification from './factory/notification';
import * as notificationGroup from './factory/notificationGroup';
import * as owner from './factory/owner';
import * as ownerGroup from './factory/ownerGroup';
import * as ownership from './factory/ownership';
import * as performance from './factory/performance';
import * as queue from './factory/queue';
import queueGroup from './factory/queueGroup';
import queueStatus from './factory/queueStatus';
import * as screen from './factory/screen';
import * as theater from './factory/theater';
import * as transaction from './factory/transaction';
import * as transactionEvent from './factory/transactionEvent';
import transactionEventGroup from './factory/transactionEventGroup';
import * as transactionInquiryKey from './factory/transactionInquiryKey';
import transactionQueuesStatus from './factory/transactionQueuesStatus';
import transactionStatus from './factory/transactionStatus';
export declare const adapter: {
    asset: (connection: Connection) => AssetAdapter;
    film: (connection: Connection) => FilmAdapter;
    owner: (connection: Connection) => OwnerAdapter;
    performance: (connection: Connection) => PerformanceAdapter;
    queue: (connection: Connection) => QueueAdapter;
    screen: (connection: Connection) => ScreenAdapter;
    theater: (connection: Connection) => TheaterAdapter;
    transaction: (connection: Connection) => TransactionAdapter;
};
export declare const service: {
    master: typeof masterService;
    notification: typeof notificationService;
    queue: typeof queueService;
    report: typeof reportService;
    sales: typeof salesService;
    stock: typeof stockService;
    transaction: typeof transactionService;
    transactionWithId: typeof transactionWithIdService;
};
export declare const factory: {
    asset: typeof asset;
    assetGroup: typeof assetGroup;
    authorization: {
        coaSeatReservation: typeof coaSeatReservationAuthorization;
        gmo: typeof gmoAuthorization;
        mvtk: typeof mvtkAuthorization;
    };
    authorizationGroup: typeof authorizationGroup;
    film: typeof film;
    notification: typeof notification;
    notificationGroup: typeof notificationGroup;
    owner: typeof owner;
    ownerGroup: typeof ownerGroup;
    ownership: typeof ownership;
    performance: typeof performance;
    queue: typeof queue;
    queueGroup: typeof queueGroup;
    queueStatus: typeof queueStatus;
    screen: typeof screen;
    theater: typeof theater;
    transaction: typeof transaction;
    transactionEventGroup: typeof transactionEventGroup;
    transactionEvent: typeof transactionEvent;
    transactionInquiryKey: typeof transactionInquiryKey;
    transactionQueuesStatus: typeof transactionQueuesStatus;
    transactionStatus: typeof transactionStatus;
};
