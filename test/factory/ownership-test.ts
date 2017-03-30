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
        OwnershipFactory.create({
            owner: 'xxx',
            authenticated: false
        });
    });

    it('所有者空なので作成できない', () => {
        let createError: any;
        try {
            OwnershipFactory.create({
                owner: '',
                authenticated: false
            });
        } catch (error) {
            createError = error;
        }

        assert(createError instanceof ArgumentNullError);
        assert.equal((<ArgumentNullError>createError).argumentName, 'owner');
    });
});
