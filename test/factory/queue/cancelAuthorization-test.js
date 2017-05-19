"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 承認取消キューファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const GmoAuthorizationFactory = require("../../../lib/factory/authorization/gmo");
const CancelAuthorizationQueueFactory = require("../../../lib/factory/queue/cancelAuthorization");
const queueStatus_1 = require("../../../lib/factory/queueStatus");
describe('承認取消キューファクトリー', () => {
    it('作成できる', () => {
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        assert.doesNotThrow(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        });
    });
    it('承認が空なので作成できない', () => {
        const authorization = {};
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'authorization');
            return true;
        });
    });
    it('ステータスが空なので作成できない', () => {
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
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
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
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
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
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
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        const lastTriedAt = {};
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: lastTriedAt,
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
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
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
        const authorization = GmoAuthorizationFactory.create({
            price: 123,
            owner_from: 'xxx',
            owner_to: 'xxx',
            gmo_shop_id: 'xxx',
            gmo_shop_pass: 'xxx',
            gmo_order_id: 'xxx',
            gmo_amount: 123,
            gmo_access_id: 'xxx',
            gmo_access_pass: 'xxx',
            gmo_job_cd: 'xxx',
            gmo_pay_type: 'xxx'
        });
        const results = {};
        assert.throws(() => {
            CancelAuthorizationQueueFactory.create({
                authorization: authorization,
                status: queueStatus_1.default.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: results
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'results');
            return true;
        });
    });
});
