/**
 * 取引スコープファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';

import OwnerGroup from '../../lib/factory/ownerGroup';
import * as TransactionScopeFactory from '../../lib/factory/transactionScope';

import ArgumentError from '../../lib/error/argument';

const TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS = 60;
let TEST_CREATE_SCOPE_ARGS: any;

before(() => {
    const readyFrom = moment();
    const readyUntil = moment(readyFrom).add(TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS, 'seconds');

    TEST_CREATE_SCOPE_ARGS = {
        ready_from: readyFrom.toDate(),
        ready_until: readyUntil.toDate(),
        client: 'test',
        theater: '118',
        owner_group: OwnerGroup.ANONYMOUS
    };
});

describe('取引スコープファクトリー 作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TransactionScopeFactory.create(TEST_CREATE_SCOPE_ARGS);
        });
    });

    it('開始準備fromがDateでなければエラー', () => {
        assert.throws(
            () => {
                const args = { ...TEST_CREATE_SCOPE_ARGS, ...{ ready_from: moment().toISOString() } };
                TransactionScopeFactory.create(args);
            },
            (error: any) => {
                assert(error instanceof ArgumentError);
                assert.equal((<ArgumentError>error).argumentName, 'ready_from');

                return true;
            }
        );
    });

    it('開始準備untilがDateでなければエラー', () => {
        assert.throws(
            () => {
                const args = { ...TEST_CREATE_SCOPE_ARGS, ...{ ready_until: moment().toISOString() } };
                TransactionScopeFactory.create(args);
            },
            (error: any) => {
                assert(error instanceof ArgumentError);
                assert.equal((<ArgumentError>error).argumentName, 'ready_until');

                return true;
            }
        );
    });

    it('開始準備untilがfromより遅くなければエラー', () => {
        assert.throws(
            () => {
                const args = {
                    ...TEST_CREATE_SCOPE_ARGS,
                    ...{
                        ready_until: moment(TEST_CREATE_SCOPE_ARGS.ready_from).add(-1, 'second').toDate()
                    }
                };
                TransactionScopeFactory.create(args);
            },
            (error: any) => {
                assert(error instanceof ArgumentError);
                assert.equal((<ArgumentError>error).argumentName, 'ready_until');

                return true;
            }
        );
    });
});

describe('取引スコープファクトリー 文字列変換', () => {
    it('変換できる', () => {
        const scope = TransactionScopeFactory.create(TEST_CREATE_SCOPE_ARGS);
        const str = TransactionScopeFactory.scope2String(scope);
        const result = /client:(.+):theater:(.+):owner_group:(.+)$/.exec(str);
        if (result === null) {
            throw new Error('invalid');
        }
        assert.deepEqual(
            // tslint:disable-next-line:no-magic-numbers
            result.splice(1, 3),
            [TEST_CREATE_SCOPE_ARGS.client, TEST_CREATE_SCOPE_ARGS.theater, TEST_CREATE_SCOPE_ARGS.owner_group]
        );
    });
});
