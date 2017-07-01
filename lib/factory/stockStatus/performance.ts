/**
 * パフォーマンス在庫状況ファクトリー
 *
 * @namespace factory/performanceStockStatus
 */

import * as _ from 'underscore';

import ArgumentError from '../../error/argument';

import * as StockStatusFactory from '../stockStatus';
import StockStatusGroup from '../stockStatusGroup';

/**
 * パフォーマンス在庫状況インターフェース
 *
 * @interface IStockStatus
 * @extends {StockStatusFactory.IStockStatus}
 */
export interface IStockStatus extends StockStatusFactory.IStockStatus {
    expression: Expression;
}

/**
 * パフォーマンス在庫状況表現インターフェース
 * 表現を変更する場合、このインターフェースを変更して対応する
 */
export type Expression = number;

/**
 * 座席数から在庫状況表現を生成する
 *
 * @param {number} numberOfAvailableSeats 空席数
 * @param {number} numberOfAllSeats 全座席数
 * @returns {Expression} 在庫状況表現
 */
export function createExpression(numberOfAvailableSeats: number, numberOfAllSeats: number): Expression {
    if (!_.isNumber(numberOfAvailableSeats)) {
        throw new ArgumentError('numberOfAvailableSeats', 'numberOfAvailableSeats should be number');
    }
    if (!_.isNumber(numberOfAllSeats)) {
        throw new ArgumentError('numberOfAllSeats', 'numberOfAllSeats should be number');
    }

    if (numberOfAllSeats === 0) {
        return 0;
    }

    // 残席数より空席率を算出
    // tslint:disable-next-line:no-magic-numbers
    return Math.floor(numberOfAvailableSeats / numberOfAllSeats * 100);
}

/**
 * パフォーマンス在庫状況を作成する
 *
 * @export
 * @param {string} args.performaceId パフォーマンスID
 * @param {Expression} args.expression 在庫状況表現
 * @returns {IStockStatus} パフォーマンス在庫状況
 */
export function create(args: {
    performaceId: string;
    expression: Expression;
}): IStockStatus {
    return {
        id: `${StockStatusGroup.PERFORMANCE}:${args.performaceId}`,
        group: StockStatusGroup.PERFORMANCE,
        expression: args.expression
    };
}
