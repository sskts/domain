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
 * キューサービステスト
 *
 * @ignore
 */
const assert = require("assert");
const moment = require("moment");
const mongoose = require("mongoose");
const SeatReservationAssetFactory = require("../../lib/factory/asset/seatReservation");
const CoaSeatReservationAuthorizationFactory = require("../../lib/factory/authorization/coaSeatReservation");
const GmoAuthorizationFactory = require("../../lib/factory/authorization/gmo");
const EmailNotificationFactory = require("../../lib/factory/notification/email");
const OwnershipFactory = require("../../lib/factory/ownership");
const DisableTransactionInquiryQueueFactory = require("../../lib/factory/queue/disableTransactionInquiry");
const PushNotificationQueueFactory = require("../../lib/factory/queue/pushNotification");
const SettleAuthorizationQueueFactory = require("../../lib/factory/queue/settleAuthorization");
const queueStatus_1 = require("../../lib/factory/queueStatus");
const TransactionFactory = require("../../lib/factory/transaction");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
const sskts = require("../../lib/index");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const queueAdapter = sskts.adapter.queue(connection);
    yield queueAdapter.model.remove({}).exec();
}));
describe('キューサービス', () => {
    it('Eメール通知成功', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: queueStatus_1.default.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.executeSendEmailNotification()(queueAdapter);
        const queueDoc = yield queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), queueStatus_1.default.EXECUTED);
    }));
    it('COA仮予約承認が不適切なので資産移動失敗', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = sskts.adapter.asset(connection);
        const queueAdapter = sskts.adapter.queue(connection);
        // test data
        const queue = SettleAuthorizationQueueFactory.create({
            authorization: CoaSeatReservationAuthorizationFactory.create({
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                coa_tmp_reserve_num: 123,
                coa_theater_code: '000',
                coa_date_jouei: '000',
                coa_title_code: '000',
                coa_title_branch_num: '000',
                coa_time_begin: '000',
                coa_screen_code: '000',
                assets: [
                    SeatReservationAssetFactory.create({
                        id: 'xxx',
                        ownership: OwnershipFactory.create({
                            owner: 'xxx',
                            authenticated: false
                        }),
                        performance: 'xxx',
                        section: '',
                        seat_code: 'xxx',
                        ticket_code: 'xxx',
                        ticket_name_ja: 'xxx',
                        ticket_name_en: '',
                        ticket_name_kana: '',
                        std_price: 0,
                        add_price: 0,
                        dis_price: 0,
                        sale_price: 0
                    })
                ]
            }),
            status: queueStatus_1.default.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.executeSettleCOASeatReservationAuthorization()(assetAdapter, queueAdapter);
        const queueDoc = yield queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), queueStatus_1.default.RUNNING);
    }));
    it('GMOオーソリが不適切なので実売上失敗', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        // test data
        const queue = SettleAuthorizationQueueFactory.create({
            authorization: GmoAuthorizationFactory.create({
                id: 'xxx',
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: 'xxx',
                gmo_shop_pass: 'xxx',
                gmo_order_id: 'xxx',
                gmo_amount: 0,
                gmo_access_id: 'xxx',
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'xxx',
                gmo_pay_type: 'xxx'
            }),
            status: queueStatus_1.default.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.executeSettleGMOAuthorization()(queueAdapter);
        const queueDoc = yield queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), queueStatus_1.default.RUNNING);
    }));
    it('照会キーがないので取引照会無効化失敗', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        // test data
        const queue = DisableTransactionInquiryQueueFactory.create({
            transaction: TransactionFactory.create({
                status: transactionStatus_1.default.CLOSED,
                owners: [],
                expires_at: new Date()
            }),
            status: queueStatus_1.default.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.executeDisableTransactionInquiry()(queueAdapter, transactionAdapter);
        const queueDoc = yield queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), queueStatus_1.default.RUNNING);
    }));
    it('リトライ成功', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: queueStatus_1.default.RUNNING,
            run_at: moment().add(-10, 'minutes').toDate(),
            max_count_try: 2,
            last_tried_at: moment().add(-10, 'minutes').toDate(),
            count_tried: 1,
            results: ['xxx']
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.retry(10)(queueAdapter); // tslint:disable-line:no-magic-numbers
        // ステータスが変更されているかどうか確認
        const retriedQueue = yield queueAdapter.model.findById(queue.id).exec();
        assert.equal(retriedQueue.get('status'), queueStatus_1.default.UNEXECUTED);
    }));
    it('中止成功', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: queueStatus_1.default.RUNNING,
            run_at: moment().add(-10, 'minutes').toDate(),
            max_count_try: 1,
            last_tried_at: moment().add(-10, 'minutes').toDate(),
            count_tried: 1,
            results: ['xxx']
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.abort(10)(queueAdapter); // tslint:disable-line:no-magic-numbers
        // ステータスが変更されているかどうか確認
        const queueDoc = yield queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), queueStatus_1.default.ABORTED);
    }));
    it('最大試行回数に達するとリトライしない', () => __awaiter(this, void 0, void 0, function* () {
        const queueAdapter = sskts.adapter.queue(connection);
        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: queueStatus_1.default.RUNNING,
            run_at: moment().add(-10, 'minutes').toDate(),
            max_count_try: 1,
            last_tried_at: moment().add(-10, 'minutes').toDate(),
            count_tried: 1,
            results: ['xxx']
        });
        yield queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        yield sskts.service.queue.retry(10)(queueAdapter); // tslint:disable-line:no-magic-numbers
        // ステータスが変更されているかどうか確認
        const retriedQueue = yield queueAdapter.model.findById(queue.id).exec();
        assert.equal(retriedQueue.get('status'), queueStatus_1.default.RUNNING);
    }));
});
