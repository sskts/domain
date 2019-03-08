/**
 * indexテスト
 */
import * as assert from 'assert';

import * as domain from './index';

describe('import domain', () => {
    it('ドメインをオブジェクトとしてインポートできるはず', () => {
        assert.equal(typeof domain, 'object');
    });
});
