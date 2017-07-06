/**
 * sskts-domainモジュール
 *
 * @module
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as mongoose from 'mongoose';
import * as redis from 'redis';

import * as ClientService from './service/client';
import * as MasterService from './service/master';
import * as MemberService from './service/member';
import * as NotificationService from './service/notification';
import * as ReportService from './service/report';
import * as SalesService from './service/sales';
import * as ShopService from './service/shop';
import * as StockService from './service/stock';
import * as StockStatusService from './service/stockStatus';
import * as TaskService from './service/task';
import * as TransactionService from './service/transaction';
import * as TransactionWithIdService from './service/transactionWithId';

import AssetAdapter from './adapter/asset';
import ClientAdapter from './adapter/client';
import FilmAdapter from './adapter/film';
import GMONotificationAdapter from './adapter/gmoNotification';
import OwnerAdapter from './adapter/owner';
import PerformanceAdapter from './adapter/performance';
import ScreenAdapter from './adapter/screen';
import SendGridEventAdapter from './adapter/sendGridEvent';
import PerformanceStockStatusAdapter from './adapter/stockStatus/performance';
import TaskAdapter from './adapter/task';
import TelemetryAdapter from './adapter/telemetry';
import TheaterAdapter from './adapter/theater';
import TransactionAdapter from './adapter/transaction';
import TransactionCountAdapter from './adapter/transactionCount';

import * as SeatReservationAssetFactory from './factory/asset/seatReservation';
import AssetGroup from './factory/assetGroup';
import * as CoaSeatReservationAuthorizationFactory from './factory/authorization/coaSeatReservation';
import * as GmoAuthorizationFactory from './factory/authorization/gmo';
import * as MvtkAuthorizationFactory from './factory/authorization/mvtk';
import AuthorizationGroup from './factory/authorizationGroup';
import * as GMOCardFactory from './factory/card/gmo';
import CardGroup from './factory/cardGroup';
import * as GMOCardIdFactory from './factory/cardId/gmo';
import * as ClientFactory from './factory/client';
import * as ClientEventFactory from './factory/clientEvent';
import * as ClientUserFactory from './factory/clientUser';
import * as FilmFactory from './factory/film';
import * as EmailNotificationFactory from './factory/notification/email';
import NotificationGroup from './factory/notificationGroup';
import * as AnonymousOwnerFactory from './factory/owner/anonymous';
import * as MemberOwnerFactory from './factory/owner/member';
import * as PromoterOwnerFactory from './factory/owner/promoter';
import OwnerGroup from './factory/ownerGroup';
import * as OwnershipFactory from './factory/ownership';
import * as PerformanceFactory from './factory/performance';
import * as ScreenFactory from './factory/screen';
import * as PerformanceStockStatusFactory from './factory/stockStatus/performance';
import TaskName from './factory/taskName';
import * as TheaterFactory from './factory/theater';
import TheaterWebsiteGroup from './factory/theaterWebsiteGroup';
import * as TransactionFactory from './factory/transaction';
import * as AddNotificationTransactionEventFactory from './factory/transactionEvent/addNotification';
import * as AuthorizeTransactionEventFactory from './factory/transactionEvent/authorize';
import * as RemoveNotificationTransactionEventFactory from './factory/transactionEvent/removeNotification';
import * as UnauthorizeTransactionEventFactory from './factory/transactionEvent/unauthorize';
import TransactionEventGroup from './factory/transactionEventGroup';
import * as TransactionInquiryKeyFactory from './factory/transactionInquiryKey';
import * as TransactionScopeFactory from './factory/transactionScope';
import TransactionStatus from './factory/transactionStatus';

import ErrorCode from './errorCode';

/**
 * MongoDBクライアント`mongoose`
 *
 * @example
 * var promise = sskts.mongoose.connect('mongodb://localhost/myapp', {
 *     useMongoClient: true
 * });
 */
export import mongoose = mongoose;

/**
 * Redis Cacheクライアント
 *
 * @example
 * const client = sskts.redis.createClient({
 *      host: process.env.REDIS_HOST,
 *      port: process.env.REDIS_PORT,
 *      password: process.env.REDIS_KEY,
 *      tls: { servername: process.env.TEST_REDIS_HOST }
 * });
 */
export import redis = redis;

/**
 * COAのAPIクライアント
 *
 * @example
 * sskts.COA.MasterService.theater({ theater_code: '118' }).then(() => {
 *     console.log(result);
 * });
 */
export import COA = COA;

/**
 * GMOのAPIクライアント
 *
 * @example
 * sskts.GMO.services.card.searchMember({
 *     siteId: '',
 *     sitePass: '',
 *     memberId: ''
 * }).then((result) => {
 *     console.log(result);
 * });
 */
export import GMO = GMO;

export namespace adapter {
    export function asset(connection: mongoose.Connection) {
        return new AssetAdapter(connection);
    }
    export function client(connection: mongoose.Connection) {
        return new ClientAdapter(connection);
    }
    export function film(connection: mongoose.Connection) {
        return new FilmAdapter(connection);
    }
    export function gmoNotification(connection: mongoose.Connection) {
        return new GMONotificationAdapter(connection);
    }
    export function owner(connection: mongoose.Connection) {
        return new OwnerAdapter(connection);
    }
    export function performance(connection: mongoose.Connection) {
        return new PerformanceAdapter(connection);
    }
    export namespace stockStatus {
        export function performance(redisClient: redis.RedisClient) {
            return new PerformanceStockStatusAdapter(redisClient);
        }
    }
    export function screen(connection: mongoose.Connection) {
        return new ScreenAdapter(connection);
    }
    export function sendGridEvent(connection: mongoose.Connection) {
        return new SendGridEventAdapter(connection);
    }
    export function task(connection: mongoose.Connection) {
        return new TaskAdapter(connection);
    }
    export function telemetry(connection: mongoose.Connection) {
        return new TelemetryAdapter(connection);
    }
    export function theater(connection: mongoose.Connection) {
        return new TheaterAdapter(connection);
    }
    export function transaction(connection: mongoose.Connection) {
        return new TransactionAdapter(connection);
    }
    export function transactionCount(redisClient: redis.RedisClient) {
        return new TransactionCountAdapter(redisClient);
    }
}

export namespace service {
    export import client = ClientService;
    export import master = MasterService;
    export import member = MemberService;
    export import notification = NotificationService;
    export import report = ReportService;
    export import sales = SalesService;
    export import shop = ShopService;
    export import stock = StockService;
    export import stockStatus = StockStatusService;
    export import task = TaskService;
    export import transaction = TransactionService;
    export import transactionWithId = TransactionWithIdService;
}

export namespace factory {
    export namespace asset {
        export import seatReservation = SeatReservationAssetFactory;
    }
    export import assetGroup = AssetGroup;
    export namespace authorization {
        export import coaSeatReservation = CoaSeatReservationAuthorizationFactory;
        export import gmo = GmoAuthorizationFactory;
        export import mvtk = MvtkAuthorizationFactory;
    }
    export import authorizationGroup = AuthorizationGroup;
    export namespace card {
        export import gmo = GMOCardFactory;
    }
    export namespace cardId {
        export import gmo = GMOCardIdFactory;
    }
    export import cardGroup = CardGroup;
    export import client = ClientFactory;
    export import clientEvent = ClientEventFactory;
    export import clientUser = ClientUserFactory;
    export import film = FilmFactory;
    export namespace notification {
        export import email = EmailNotificationFactory;
    }
    export import notificationGroup = NotificationGroup;
    export namespace owner {
        export import anonymous = AnonymousOwnerFactory;
        export import member = MemberOwnerFactory;
        export import promoter = PromoterOwnerFactory;
    }
    export import ownerGroup = OwnerGroup;
    export import ownership = OwnershipFactory;
    export import performance = PerformanceFactory;
    export import screen = ScreenFactory;
    export namespace stockStatus {
        export import performance = PerformanceStockStatusFactory;
    }
    export import taskName = TaskName;
    export import theater = TheaterFactory;
    export import theaterWebsiteGroup = TheaterWebsiteGroup;
    export import transaction = TransactionFactory;
    export namespace transactionEvent {
        export import addNotification = AddNotificationTransactionEventFactory;
        export import authorize = AuthorizeTransactionEventFactory;
        export import removeNotification = RemoveNotificationTransactionEventFactory;
        export import unauthorize = UnauthorizeTransactionEventFactory;
    }
    export import transactionEventGroup = TransactionEventGroup;
    export import transactionInquiryKey = TransactionInquiryKeyFactory;
    export import transactionScope = TransactionScopeFactory;
    export import transactionStatus = TransactionStatus;
}

export import errorCode = ErrorCode;
