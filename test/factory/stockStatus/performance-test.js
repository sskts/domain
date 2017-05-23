"use strict";
/**
 * パフォーマンス在庫状況ファクトリーテスト
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const moment = require("moment");
const PerformanceStockStatusFactory = require("../../../lib/factory/stockStatus/performance");
describe('パフォーマンス空席状況ファクトリー 生成', () => {
    it('期限切れ', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const expression = PerformanceStockStatusFactory.createExpression(moment().add(-1, 'days').format('YYYYMMDD'), 50, 100);
            assert.equal(expression, PerformanceStockStatusFactory.Expression.EXPIRED);
        });
    });
    it('○', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const expression = PerformanceStockStatusFactory.createExpression(moment().add(1, 'days').format('YYYYMMDD'), 50, 100);
            assert.equal(expression, PerformanceStockStatusFactory.Expression.AVAILABLE_MANY);
        });
    });
    it('△', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const expression = PerformanceStockStatusFactory.createExpression(moment().add(1, 'days').format('YYYYMMDD'), 1, 100);
            assert.equal(expression, PerformanceStockStatusFactory.Expression.AVAILABLE_FEW);
        });
    });
    it('×', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const expression = PerformanceStockStatusFactory.createExpression(moment().add(1, 'days').format('YYYYMMDD'), 0, 100);
            assert.equal(expression, PerformanceStockStatusFactory.Expression.UNAVAILABLE);
        });
    });
});
