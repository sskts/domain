/**
 * 取引照会キーファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../lib/error/argument';
import ArgumentNullError from '../../lib/error/argumentNull';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';

describe('取引照会キーファクトリー', () => {
    it('作成できる', () => {
        TransactionInquiryKeyFactory.create({
            theater_code: 'xxx',
            reserve_num: 123,
            tel: 'xxx',
        });
    });

    it('劇場コード空なので作成できない', () => {
        let createError: any;
        try {
            TransactionInquiryKeyFactory.create({
                theater_code: '',
                reserve_num: 123,
                tel: 'xxx',
            });
        } catch (error) {
            createError = error;
        }

        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'theater_code');
    });

    it('購入番号が数字でないので作成できない', () => {
        let createError: any;
        try {
            TransactionInquiryKeyFactory.create({
                theater_code: 'xxx',
                reserve_num: <any>'123',
                tel: 'xxx',
            });
        } catch (error) {
            createError = error;
        }

        assert(createError instanceof ArgumentError);
        assert.equal((<ArgumentError>createError).argumentName, 'reserve_num');
    });
});
