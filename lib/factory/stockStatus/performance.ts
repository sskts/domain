/**
 * パフォーマンス在庫状況ファクトリー
 * todo jsdoc
 *
 * @namespace factory/performanceStockStatus
 */

import * as moment from 'moment';
import * as StockStatusFactory from '../stockStatus';
import StockStatusGroup from '../stockStatusGroup';

/**
 * パフォーマンス在庫状況インターフェース
 *
 * @interface IPerformanceStockStatus
 * @extends {StockStatusFactory.IStockStatus}
 */
export interface IPerformanceStockStatus extends StockStatusFactory.IStockStatus {
    expression: Expression;
}

/**
 * パフォーマンス在庫状況表現インターフェース
 */
export type Expression =
    '○'
    | '△'
    | '×'
    | '-'
    ;

/**
 * パフォーマンス在庫状況表現
 */
export namespace Expression {
    export const AVAILABLE_MANY = '○';
    export const AVAILABLE_FEW = '△';
    export const UNAVAILABLE = '×';
    export const EXPIRED = '-';
}

/**
 * 座席数から在庫状況表現を生成する
 *
 * @param {string} day 上映日
 * @param {number} numberOfAvailableSeats 空席数
 * @param {number} numberOfAllSeats 全座席数
 * @returns {Expression} 在庫状況表現
 */
export function createExpression(day: string, numberOfAvailableSeats: number, numberOfAllSeats: number): Expression {
    // 上映日当日過ぎていれば期限切れ
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(day, 10) < parseInt(moment().format('YYYYMMDD'), 10)) {
        return Expression.EXPIRED;
    }

    // 残席数よりステータスを算出
    // tslint:disable-next-line:no-magic-numbers
    if (30 * numberOfAllSeats < 100 * numberOfAvailableSeats) {
        return Expression.AVAILABLE_MANY;
    }
    if (0 < numberOfAvailableSeats) {
        return Expression.AVAILABLE_FEW;
    }

    // 残席0以下なら問答無用に×
    return Expression.UNAVAILABLE;
}

export function create(args: {
    performaceId: string;
    expression: Expression;
}): IPerformanceStockStatus {
    return {
        id: `${StockStatusGroup.PERFORMANCE}${args.performaceId}`,
        group: StockStatusGroup.PERFORMANCE,
        expression: args.expression
    };
}
