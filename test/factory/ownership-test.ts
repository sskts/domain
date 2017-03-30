/**
 * 所有権ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentNullError from '../../lib/error/argumentNull';
import * as OwnershipFactory from '../../lib/factory/ownership';

describe('所有権ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            OwnershipFactory.create({
                owner: 'xxx',
                authenticated: false
            });
        });
    });

    it('所有者空なので作成できない', () => {
        assert.throws(
            () => {
                OwnershipFactory.create({
                    owner: '',
                    authenticated: false
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'owner');
                return true;
            }
        );
    });
});
