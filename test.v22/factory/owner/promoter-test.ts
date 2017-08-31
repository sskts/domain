/**
 * 興行所有者ファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import * as PromoterOwnerFactory from '../../../lib/factory/owner/promoter';

describe('興行所有者ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            PromoterOwnerFactory.create({
            });
        });
    });
});
