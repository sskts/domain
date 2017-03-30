/**
 * 取引ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../lib/error/argument';
import ArgumentNullError from '../../lib/error/argumentNull';

import * as TransactionFactory from '../../lib/factory/transaction';
import TransactionStatus from '../../lib/factory/transactionStatus';

describe('取引ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TransactionFactory.create({
                status: TransactionStatus.CLOSED,
                owners: [],
                expires_at: new Date()
            });
        });
    });

    it('ステータスが空なので作成できない', () => {
        assert.throws(
            () => {
                TransactionFactory.create({
                    status: <any>'',
                    owners: [],
                    expires_at: new Date()
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'status');
                return true;
            }
        );
    });

    it('所有者リストが配列でないので作成できない', () => {
        assert.throws(
            () => {
                TransactionFactory.create({
                    status: TransactionStatus.CLOSED,
                    owners: <any>{},
                    expires_at: new Date()
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'owners');
                return true;
            }
        );
    });

    it('期限が不適切なので作成できない', () => {
        assert.throws(
            () => {
                TransactionFactory.create({
                    status: TransactionStatus.CLOSED,
                    owners: [],
                    expires_at: <any>{}
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'expires_at');
                return true;
            }
        );
    });
});
