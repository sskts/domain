/**
 * クライアントユーザーファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import * as ClientUserFactory from '../../lib/factory/clientUser';

const TEST_CREATE_CLIENT_USER_ARGS = {
    client: 'xxx',
    state: 'xxx',
    owner: 'xxx',
    scopes: ['xxx']
};

describe('クライアントユーザーファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            ClientUserFactory.create(TEST_CREATE_CLIENT_USER_ARGS);
        });
    });
});
