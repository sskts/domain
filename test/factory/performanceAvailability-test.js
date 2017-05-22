"use strict";
/**
 * パフォーマンス空席状況ファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const moment = require("moment");
const PerformanceAvailabilityFactory = require("../../lib/factory/performanceAvailability");
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
