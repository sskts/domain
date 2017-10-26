/**
 * 一般所有者ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import * as AnonymousOwnerFactory from '../../../lib/factory/owner/anonymous';

describe('一般所有者ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            AnonymousOwnerFactory.create({
            });
        });
    });

    it('メールアドレスが不適切なので作成できない', () => {
        assert.throws(
            () => {
                AnonymousOwnerFactory.create({
                    email: 'xxx'
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'email');

                return true;
            }
        );
    });
});
