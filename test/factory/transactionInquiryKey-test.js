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
        TransactionInquiryKeyFactory.create({
            theater_code: 'xxx',
            reserve_num: 123,
            tel: 'xxx',
        });
    });
    it('劇場コード空なので作成できない', () => {
        let createError;
        try {
            TransactionInquiryKeyFactory.create({
                theater_code: '',
                reserve_num: 123,
                tel: 'xxx',
            });
        }
        catch (error) {
            createError = error;
        }
        assert(createError instanceof argumentNull_1.default);
        assert.equal(createError.argumentName, 'theater_code');
    });
    it('購入番号が数字でないので作成できない', () => {
        let createError;
        try {
            TransactionInquiryKeyFactory.create({
                theater_code: 'xxx',
                reserve_num: '123',
                tel: 'xxx',
            });
        }
        catch (error) {
            createError = error;
        }
        assert(createError instanceof argument_1.default);
        assert.equal(createError.argumentName, 'reserve_num');
    });
});
