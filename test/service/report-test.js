"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * レポートサービステスト
 *
 * @ignore
 */
const assert = require("assert");
const moment = require("moment");
const mongoose = require("mongoose");
const redis = require("redis");
const gmoNotification_1 = require("../../lib/adapter/gmoNotification");
const queue_1 = require("../../lib/adapter/queue");
const telemetry_1 = require("../../lib/adapter/telemetry");
const transaction_1 = require("../../lib/adapter/transaction");
const transactionCount_1 = require("../../lib/adapter/transactionCount");
const GMOAuthorizationFactory = require("../../lib/factory/authorization/gmo");
const TransactionFactory = require("../../lib/factory/transaction");
const AuthorizeTransactionEventFactory = require("../../lib/factory/transactionEvent/authorize");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
const TransactionScopeFactory = require("../../lib/factory/transactionScope");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
const ReportService = require("../../lib/service/report");
const TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS = 60;
const TEST_MAX_NUMBER_OF_TRANSACTIONS_PER_UNIT = 120;
describe('レポートサービス 測定データ作成', () => {
    let connection;
    let redisClient;
    before(() => __awaiter(this, void 0, void 0, function* () {
        if (typeof process.env.TEST_REDIS_HOST !== 'string') {
            throw new Error('environment variable TEST_REDIS_HOST required');
        }
        if (typeof process.env.TEST_REDIS_PORT !== 'string') {
            throw new Error('environment variable TEST_REDIS_PORT required');
        }
        if (typeof process.env.TEST_REDIS_KEY !== 'string') {
            throw new Error('environment variable TEST_REDIS_KEY required');
        }
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        redisClient = redis.createClient({
            host: process.env.TEST_REDIS_HOST,
            port: process.env.TEST_REDIS_PORT,
            password: process.env.TEST_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const dateNow = moment();
        const readyFrom = moment.unix(dateNow.unix() - dateNow.unix() % TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS);
        const readyUntil = moment(readyFrom).add(TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS, 'seconds');
        const scope = TransactionScopeFactory.create({
            ready_from: readyFrom.toDate(),
            ready_until: readyUntil.toDate()
        });
        yield ReportService.createTelemetry(scope, TEST_MAX_NUMBER_OF_TRANSACTIONS_PER_UNIT)(new queue_1.default(connection), new telemetry_1.default(connection), new transaction_1.default(connection), new transactionCount_1.default(redisClient));
    }));
});
describe('レポートサービス 取引状態', () => {
    let connection;
    before(() => __awaiter(this, void 0, void 0, function* () {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield ReportService.transactionStatuses()(new queue_1.default(connection), new transaction_1.default(connection));
    }));
});
describe('レポートサービス GMO実売上検索', () => {
    let connection;
    before(() => __awaiter(this, void 0, void 0, function* () {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const gmoNotificationAdapter = new gmoNotification_1.default(connection);
        yield gmoNotificationAdapter.gmoNotificationModel.remove({}).exec();
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        // tslint:disable-next-line:no-magic-numbers
        const dateFrom = moment().add(-10, 'minutes').toDate();
        const dateTo = moment().toDate();
        const gmoNotificationAdapter = new gmoNotification_1.default(connection);
        const notifications = [
            {
                shop_id: 'tshop00026096',
                access_id: 'c2ab15af0e7459291913adede0657f12',
                order_id: '201704151180000151900',
                status: 'SALES',
                job_cd: 'SALES',
                amount: '2000',
                tax: '0',
                currency: 'JPN',
                forward: '2a99662',
                method: '1',
                pay_times: '',
                tran_id: '1704152300111111111111877098',
                approve: '2980559',
                tran_date: moment(dateFrom).format('YYYYMMDDHHmmss'),
                err_code: '',
                err_info: '',
                pay_type: '0'
            },
            {
                shop_id: 'tshop00026096',
                access_id: 'c2ab15af0e7459291913adede0657f12',
                order_id: '201704151180000151900',
                status: 'SALES',
                job_cd: 'SALES',
                amount: '2000',
                tax: '0',
                currency: 'JPN',
                forward: '2a99662',
                method: '1',
                pay_times: '',
                tran_id: '1704152300111111111111877098',
                approve: '2980559',
                tran_date: moment(dateFrom).add(-1, 'seconds').format('YYYYMMDDHHmmss'),
                err_code: '',
                err_info: '',
                pay_type: '0'
            }
        ];
        const notificationDocs = yield gmoNotificationAdapter.gmoNotificationModel.create(notifications);
        const sales = yield ReportService.searchGMOSales(dateFrom, dateTo)(gmoNotificationAdapter);
        assert.equal(sales.length, 1);
        const promises = notificationDocs.map((notificationDoc) => __awaiter(this, void 0, void 0, function* () {
            yield notificationDoc.remove();
        }));
        yield Promise.all(promises);
    }));
});
describe('レポートサービス GMO実売上診察', () => {
    let connection;
    before(() => __awaiter(this, void 0, void 0, function* () {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const gmoNotificationAdapter = new gmoNotification_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        yield gmoNotificationAdapter.gmoNotificationModel.remove({}).exec();
        yield transactionAdapter.transactionModel.remove({}).exec();
        yield transactionAdapter.transactionEventModel.remove({}).exec();
    }));
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const reserveNum = 123;
        const shopId = '123';
        const orderId = '201704201180000012300';
        const accessId = '12345';
        const amount = 12345;
        const transactionAdapter = new transaction_1.default(connection);
        // テスト取引作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            // tslint:disable-next-line:no-magic-numbers
            expires_at: moment().add(15, 'minutes').toDate(),
            started_at: moment().toDate(),
            closed_at: moment().toDate(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '118',
                reserve_num: reserveNum,
                tel: '09012345678'
            })
        });
        // テスト取引イベント作成
        const transactionEvent = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: moment().toDate(),
            authorization: GMOAuthorizationFactory.create({
                price: amount,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: shopId,
                gmo_shop_pass: 'xxx',
                gmo_order_id: orderId,
                gmo_amount: amount,
                gmo_access_id: accessId,
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'AUTH',
                gmo_pay_type: '0'
            })
        });
        const transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        const transactionEventDoc = yield transactionAdapter.transactionEventModel.findByIdAndUpdate(transactionEvent.id, transactionEvent, { new: true, upsert: true }).exec();
        const notification = {
            shop_id: shopId,
            access_id: accessId,
            order_id: orderId,
            status: 'SALES',
            job_cd: 'SALES',
            amount: amount.toString(),
            tax: '0',
            currency: 'JPN',
            forward: 'xxx',
            method: '1',
            pay_times: '',
            tran_id: 'xxx',
            approve: 'xxx',
            tran_date: 'xxx',
            err_code: '',
            err_info: '',
            pay_type: '0'
        };
        yield ReportService.examineGMOSales(notification)(transactionAdapter);
        yield transactionDoc.remove();
        yield transactionEventDoc.remove();
    }));
});
