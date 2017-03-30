"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引照会無効化キューファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const DisableTransactionInquiryQueueFactory = require("../../../lib/factory/queue/disableTransactionInquiry");
const queueStatus_1 = require("../../../lib/factory/queueStatus");
const TransactionFactory = require("../../../lib/factory/transaction");
const transactionStatus_1 = require("../../../lib/factory/transactionStatus");
describe('取引照会無効化キューファクトリー', () => {
    it('作成できる', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.doesNotThrow(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        });
    });
    it('取引が空なので作成できない', () => {
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: {},
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'transaction');
            return true;
        });
    });
    it('ステータスが空なので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: '',
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'status');
            return true;
        });
    });
    it('実行日時が不適切なので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: (new Date()).toString,
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'run_at');
            return true;
        });
    });
    it('最大試行回数が数字でないので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: '10',
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'max_count_try');
            return true;
        });
    });
    it('最終試行日時が不適切なので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: {},
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'last_tried_at');
            return true;
        });
    });
    it('試行回数が数字でないので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: '0',
                results: []
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'count_tried');
            return true;
        });
    });
    it('結果が配列でないので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        assert.throws(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: {}
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'results');
            return true;
        });
    });
});
