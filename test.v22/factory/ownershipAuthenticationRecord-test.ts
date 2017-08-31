/**
 * 所有権認証記録ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../lib/error/argument';
import ArgumentNullError from '../../lib/error/argumentNull';

import * as OwnershipAuthenticationRecordFactory from '../../lib/factory/ownershipAuthenticationRecord';

// 所有権認証記録生成メソッドの有効なパラメーター
let validCreateOwnershipAuthenticationRecordArgs: OwnershipAuthenticationRecordFactory.IOwnershipAuthenticationRecord;
before(() => {
    validCreateOwnershipAuthenticationRecordArgs = {
        when: new Date(),
        where: 'xxx',
        why: 'xxx',
        how: 'xxx'

    };
});

describe('所有権認証記録ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            OwnershipAuthenticationRecordFactory.create(validCreateOwnershipAuthenticationRecordArgs);
        });
    });

    it('「いつ」がDateでないので作成できない', () => {
        const args = { ...validCreateOwnershipAuthenticationRecordArgs };
        const when: any = '2017-05-20T06:24:32.910Z';
        args.when = when;

        assert.throws(
            () => {
                OwnershipAuthenticationRecordFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'when');

                return true;
            }
        );
    });

    it('「どこで」が空なので作成できない', () => {
        const args = { ...validCreateOwnershipAuthenticationRecordArgs };
        args.where = '';

        assert.throws(
            () => {
                OwnershipAuthenticationRecordFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'where');

                return true;
            }
        );
    });

    it('「何のために」が空なので作成できない', () => {
        const args = { ...validCreateOwnershipAuthenticationRecordArgs };
        args.why = '';

        assert.throws(
            () => {
                OwnershipAuthenticationRecordFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'why');

                return true;
            }
        );
    });

    it('「どうやって」が空なので作成できない', () => {
        const args = { ...validCreateOwnershipAuthenticationRecordArgs };
        args.how = '';

        assert.throws(
            () => {
                OwnershipAuthenticationRecordFactory.create(args);
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'how');

                return true;
            }
        );
    });
});
