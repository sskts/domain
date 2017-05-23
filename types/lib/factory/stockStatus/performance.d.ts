import * as StockStatusFactory from '../stockStatus';
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
export declare type Expression = '○' | '△' | '×' | '-';
/**
 * パフォーマンス在庫状況表現
 */
export declare namespace Expression {
    const AVAILABLE_MANY = "○";
    const AVAILABLE_FEW = "△";
    const UNAVAILABLE = "×";
    const EXPIRED = "-";
}
/**
 * 座席数から在庫状況表現を生成する
 *
 * @param {string} day 上映日
 * @param {number} numberOfAvailableSeats 空席数
 * @param {number} numberOfAllSeats 全座席数
 * @returns {Expression} 在庫状況表現
 */
export declare function createExpression(day: string, numberOfAvailableSeats: number, numberOfAllSeats: number): Expression;
export declare function create(args: {
    performaceId: string;
    expression: Expression;
}): IPerformanceStockStatus;
