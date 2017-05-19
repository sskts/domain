"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引照会キーファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../lib/error/argument");
const argumentNull_1 = require("../../lib/error/argumentNull");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
describe('取引照会キーファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TransactionInquiryKeyFactory.create({
                theater_code: 'xxx',
                reserve_num: 123,
                tel: 'xxx'
            });
        });
    });
    it('劇場コード空なので作成できない', () => {
        assert.throws(() => {
            TransactionInquiryKeyFactory.create({
                theater_code: '',
                reserve_num: 123,
                tel: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'theater_code');
            return true;
        });
    });
    it('購入番号が数字でないので作成できない', () => {
        assert.throws(() => {
            TransactionInquiryKeyFactory.create({
                theater_code: 'xxx',
                reserve_num: '123',
                tel: 'xxx'
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'reserve_num');
            return true;
        });
    });
});
