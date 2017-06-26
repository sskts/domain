/**
 * パフォーマンス在庫状況ファクトリーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';

import * as PerformanceStockStatusFactory from '../../../lib/factory/stockStatus/performance';

describe('パフォーマンス空席状況ファクトリー 在庫状況表現作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const expression = PerformanceStockStatusFactory.createExpression(50, 100);
            assert.equal(typeof expression, 'number');
        });
    });

    it('空席数が数字でないとエラー', () => {
        assert.throws(
            () => {
                // tslint:disable-next-line:no-magic-numbers
                const expression = PerformanceStockStatusFactory.createExpression(<any>'50', 100);
                assert.equal(typeof expression, 'number');
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'numberOfAvailableSeats');

                return true;
            }
        );
    });

    it('全座席数が数字でないとエラー', () => {
        assert.throws(
            () => {
                // tslint:disable-next-line:no-magic-numbers
                const expression = PerformanceStockStatusFactory.createExpression(50, <any>'100');
                assert.equal(typeof expression, 'number');
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'numberOfAllSeats');

                return true;
            }
        );
    });

    it('全座席数が0であれば0', () => {
        assert.doesNotThrow(
            () => {
                // tslint:disable-next-line:no-magic-numbers
                const expression = PerformanceStockStatusFactory.createExpression(50, 0);
                assert.equal(expression, 0);
            }
        );
    });
});

describe('パフォーマンス空席状況ファクトリー 在庫状況作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            // tslint:disable-next-line:no-magic-numbers
            const stockStatus = PerformanceStockStatusFactory.create({
                performaceId: 'xxx',
                expression: 100
            });
            assert.equal(typeof stockStatus.id, 'string');
        });
    });
});
