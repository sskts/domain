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
        assert.doesNotThrow(() => {
            TransactionInquiryKeyFactory.create({
                theater_code: 'xxx',
                reserve_num: 123,
                tel: 'xxx',
            });
        });
    });

    it('劇場コード空なので作成できない', () => {
        assert.throws(
            () => {
                TransactionInquiryKeyFactory.create({
                    theater_code: '',
                    reserve_num: 123,
                    tel: 'xxx',
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'theater_code');
                return true;
            }
        );
    });

    it('購入番号が数字でないので作成できない', () => {
        assert.throws(
            () => {
                TransactionInquiryKeyFactory.create({
                    theater_code: 'xxx',
                    reserve_num: <any>'123',
                    tel: 'xxx',
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'reserve_num');
                return true;
            }
        );
    });
});
