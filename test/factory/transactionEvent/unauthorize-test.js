"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 承認取消取引イベントファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const GmoAuthorizationFactory = require("../../../lib/factory/authorization/gmo");
const UnauthorizeTransactionEventFactory = require("../../../lib/factory/transactionEvent/unauthorize");
describe('承認取消取引イベントファクトリー', () => {
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
            UnauthorizeTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: new Date(),
                authorization: authorization
            });
        });
    });
    it('発生日時が不適切なので作成できない', () => {
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
            UnauthorizeTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: (new Date()).toString(),
                authorization: authorization
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'occurred_at');
            return true;
        });
    });
    it('取引が空なので作成できない', () => {
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
            UnauthorizeTransactionEventFactory.create({
                transaction: '',
                occurred_at: new Date(),
                authorization: authorization
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'transaction');
            return true;
        });
    });
    it('承認が空なので作成できない', () => {
        const authorization = {};
        assert.throws(() => {
            UnauthorizeTransactionEventFactory.create({
                transaction: 'xxx',
                occurred_at: new Date(),
                authorization: authorization
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'authorization');
            return true;
        });
    });
});
