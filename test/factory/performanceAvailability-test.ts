/**
 * パフォーマンス空席状況ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';

import * as PerformanceAvailabilityFactory from '../../lib/factory/performanceAvailability';

describe('パフォーマンス空席状況ファクトリー 生成', () => {
    it('期限切れ', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const availability = PerformanceAvailabilityFactory.create(moment().add(-1, 'days').format('YYYYMMDD'), 50, 100);
            assert.equal(availability, PerformanceAvailabilityFactory.Availability.EXPIRED);
        });
    });

    it('○', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const availability = PerformanceAvailabilityFactory.create(moment().add(1, 'days').format('YYYYMMDD'), 50, 100);
            assert.equal(availability, PerformanceAvailabilityFactory.Availability.MANY);
        });
    });

    it('△', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const availability = PerformanceAvailabilityFactory.create(moment().add(1, 'days').format('YYYYMMDD'), 1, 100);
            assert.equal(availability, PerformanceAvailabilityFactory.Availability.FEW);
        });
    });

    it('×', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const availability = PerformanceAvailabilityFactory.create(moment().add(1, 'days').format('YYYYMMDD'), 0, 100);
            assert.equal(availability, PerformanceAvailabilityFactory.Availability.UNAVAILABLE);
        });
    });
});
