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
 * 取引サービステスト
 *
 * @ignore
 */
const assert = require("assert");
const moment = require("moment");
const mongoose = require("mongoose");
const redis = require("redis");
const sskts = require("../../lib/index");
const EmailNotificationFactory = require("../../lib/factory/notification/email");
const queueGroup_1 = require("../../lib/factory/queueGroup");
const TransactionFactory = require("../../lib/factory/transaction");
const AddNotificationTransactionEventFactory = require("../../lib/factory/transactionEvent/addNotification");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
const transactionQueuesStatus_1 = require("../../lib/factory/transactionQueuesStatus");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
const transactionCount_1 = require("../../lib/adapter/transactionCount");
let redisClient;
let connection;
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
    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    yield transactionAdapter.transactionModel.remove({}).exec();
}));
describe('取引サービス 可能であれば開始する', () => {
    it('取引数制限を越えているため開始できない', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionCountAdapter = new transactionCount_1.default(redisClient);
        // tslint:disable-next-line:no-magic-numbers
        const expiresAt = moment().add(30, 'minutes').toDate();
        const unitOfCountInSeconds = 60;
        const maxCountPerUnit = 0;
        const transactionOption = yield sskts.service.transaction.startIfPossible(expiresAt, unitOfCountInSeconds, maxCountPerUnit)(ownerAdapter, transactionAdapter, transactionCountAdapter);
        assert(transactionOption.isEmpty);
    }));
    it('開始できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionCountAdapter = new transactionCount_1.default(redisClient);
        // tslint:disable-next-line:no-magic-numbers
        const expiresAt = moment().add(30, 'minutes').toDate();
        const unitOfCountInSeconds = 60;
        const maxCountPerUnit = 999;
        const transactionOption = yield sskts.service.transaction.startIfPossible(expiresAt, unitOfCountInSeconds, maxCountPerUnit)(ownerAdapter, transactionAdapter, transactionCountAdapter);
        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().status, sskts.factory.transactionStatus.UNDERWAY);
        assert.equal(transactionOption.get().expires_at.valueOf(), expiresAt.valueOf());
    }));
});
describe('取引サービス', () => {
    it('prepare ok', () => __awaiter(this, void 0, void 0, function* () {
        yield sskts.service.transaction.prepare(3, 60)(sskts.adapter.transaction(connection)); // tslint:disable-line:no-magic-numbers
    }));
    it('makeExpired ok', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = sskts.adapter.transaction(connection);
        // 期限切れの取引を作成
        yield sskts.service.transaction.prepare(3, -60)(transactionAdapter); // tslint:disable-line:no-magic-numbers
        yield sskts.service.transaction.makeExpired()(transactionAdapter);
    }));
    it('clean should be removed', () => __awaiter(this, void 0, void 0, function* () {
        // test data
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionIds = [];
        const promises = Array.from(Array(3).keys()).map(() => __awaiter(this, void 0, void 0, function* () {
            const transaction = TransactionFactory.create({
                status: transactionStatus_1.default.READY,
                owners: [],
                expires_at: moment().add(0, 'seconds').toDate()
            });
            yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
            transactionIds.push(transaction.id);
        }));
        yield Promise.all(promises);
        yield sskts.service.transaction.clean()(sskts.adapter.transaction(connection));
        const nubmerOfTransaction = yield transactionAdapter.transactionModel.find({ _id: { $in: transactionIds } }).count().exec();
        assert.equal(nubmerOfTransaction, 0);
    }));
    it('clean should not be removed', () => __awaiter(this, void 0, void 0, function* () {
        // test data
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionIds = [];
        const promises = Array.from(Array(3).keys()).map(() => __awaiter(this, void 0, void 0, function* () {
            const transaction = TransactionFactory.create({
                status: transactionStatus_1.default.READY,
                owners: [],
                expires_at: moment().add(60, 'seconds').toDate() // tslint:disable-line:no-magic-numbers
            });
            yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
            transactionIds.push(transaction.id);
        }));
        yield Promise.all(promises);
        yield sskts.service.transaction.clean()(sskts.adapter.transaction(connection));
        const nubmerOfTransaction = yield transactionAdapter.transactionModel.find({ _id: { $in: transactionIds } }).count().exec();
        assert.equal(nubmerOfTransaction, 3); // tslint:disable-line:no-magic-numbers
    }));
});
describe('取引サービス 再エクスポート', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = sskts.adapter.transaction(connection);
        // test data
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus_1.default.EXPORTING
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        yield sskts.service.transaction.reexportQueues(0)(transactionAdapter); // tslint:disable-line:no-magic-numbers
        // ステータスが変更されているかどうか確認
        const retriedTransaction = yield transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert.equal(retriedTransaction.get('queues_status'), transactionQueuesStatus_1.default.UNEXPORTED);
        // テストデータ削除
        yield retriedTransaction.remove();
    }));
});
describe('取引サービス キューエクスポート', () => {
    it('ok.', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const status = transactionStatus_1.default.CLOSED;
        // test data
        const transaction = TransactionFactory.create({
            status: status,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, {
            new: true, upsert: true,
            setDefaultsOnInsert: false
        }).exec();
        yield sskts.service.transaction.exportQueues(status)(queueAdapter, transactionAdapter);
        // 取引のキューエクスポートステータスを確認
        const transactionDoc = yield transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert.equal(transactionDoc.get('queues_status'), transactionQueuesStatus_1.default.EXPORTED);
        // テストデータ削除
        yield transactionDoc.remove();
    }));
    it('ステータスが不適切なので失敗', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const status = transactionStatus_1.default.UNDERWAY;
        // test data
        const transaction = TransactionFactory.create({
            status: status,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        let exportQueues;
        try {
            yield sskts.service.transaction.exportQueues(status)(queueAdapter, transactionAdapter);
        }
        catch (error) {
            exportQueues = error;
        }
        assert(exportQueues instanceof Error);
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('取引サービス 取引IDからキュー出力する', () => {
    it('成立取引の出力成功', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        // test data
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus_1.default.UNEXPORTED
        });
        const event = AddNotificationTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:transaction-test',
                content: 'sskts-domain:test:service:transaction-test'
            })
        });
        const transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        yield transactionAdapter.addEvent(event);
        yield sskts.service.transaction.exportQueuesById(transaction.id)(queueAdapter, transactionAdapter);
        const queueDoc4pushNotification = yield queueAdapter.model.findOne({
            group: queueGroup_1.default.PUSH_NOTIFICATION,
            'notification.id': event.notification.id
        }).exec();
        assert.notEqual(queueDoc4pushNotification, null);
        yield transactionDoc.remove();
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield queueDoc4pushNotification.remove();
    }));
});
describe('取引サービス 利用可能かどうか', () => {
    it('最大数に達していないので利用可能', () => __awaiter(this, void 0, void 0, function* () {
        const transactionCountAdapter = sskts.adapter.transactionCount(redisClient);
        // test data
        const scope = moment().valueOf().toString();
        const COUNT_UNIT = 60;
        const MAX_COUNT_PER_UNIT = 999999; // 十分に大きな数字
        const isAvailable = yield sskts.service.transaction.isAvailable(scope, COUNT_UNIT, MAX_COUNT_PER_UNIT)(transactionCountAdapter);
        assert(isAvailable);
    }));
    it('最大数を超過しているので利用できない', () => __awaiter(this, void 0, void 0, function* () {
        const transactionCountAdapter = sskts.adapter.transactionCount(redisClient);
        // test data
        const scope = moment().valueOf().toString();
        const COUNT_UNIT = 60;
        const MAX_COUNT_PER_UNIT = 0;
        const isAvailable = yield sskts.service.transaction.isAvailable(scope, COUNT_UNIT, MAX_COUNT_PER_UNIT)(transactionCountAdapter);
        assert(!isAvailable);
    }));
    it('連続利用で結果が適切に変わる', () => __awaiter(this, void 0, void 0, function* () {
        const transactionCountAdapter = sskts.adapter.transactionCount(redisClient);
        // test data
        const scope = moment().valueOf().toString();
        const COUNT_UNIT = 5;
        const MAX_COUNT_PER_UNIT = 1;
        // 初回は利用可能なはず
        const isAvailable = yield sskts.service.transaction.isAvailable(scope, COUNT_UNIT, MAX_COUNT_PER_UNIT)(transactionCountAdapter);
        assert(isAvailable);
        // 2回目は利用不可能なはず
        const isAvailable2 = yield sskts.service.transaction.isAvailable(scope, COUNT_UNIT, MAX_COUNT_PER_UNIT)(transactionCountAdapter);
        assert(!isAvailable2);
        // {COUNT_UNIT}秒後にはまた利用可能なはず
        return new Promise((resolve, reject) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const isAvailable3 = yield sskts.service.transaction.isAvailable(scope, COUNT_UNIT, MAX_COUNT_PER_UNIT)(transactionCountAdapter);
                    if (isAvailable3) {
                        resolve();
                    }
                    else {
                        reject(new Error('should be available'));
                    }
                }
                catch (error) {
                    reject(error);
                }
            }), 
            // tslint:disable-next-line:no-magic-numbers
            COUNT_UNIT * 1000);
        });
    }));
});
