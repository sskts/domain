"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GMOオーソリファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../../lib/error/argument");
const argumentNull_1 = require("../../../lib/error/argumentNull");
const GmoAuthorizationFactory = require("../../../lib/factory/authorization/gmo");
describe('GMOオーソリファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            GmoAuthorizationFactory.create({
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
        });
    });
    it('ショップIDが空なので作成できない', () => {
        assert.throws(() => {
            GmoAuthorizationFactory.create({
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: '',
                gmo_shop_pass: 'xxx',
                gmo_order_id: 'xxx',
                gmo_amount: 123,
                gmo_access_id: 'xxx',
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'xxx',
                gmo_pay_type: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'gmo_shop_id');
            return true;
        });
    });
    it('GMO金額が数字でないので作成できない', () => {
        assert.throws(() => {
            GmoAuthorizationFactory.create({
                price: 123,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: 'xxx',
                gmo_shop_pass: 'xxx',
                gmo_order_id: 'xxx',
                gmo_amount: '123',
                gmo_access_id: 'xxx',
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'xxx',
                gmo_pay_type: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'gmo_amount');
            return true;
        });
    });
});
