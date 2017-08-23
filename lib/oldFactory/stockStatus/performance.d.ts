import * as StockStatusFactory from '../stockStatus';
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
export declare type Expression = number;
/**
 * 座席数から在庫状況表現を生成する
 *
 * @param {number} numberOfAvailableSeats 空席数
 * @param {number} numberOfAllSeats 全座席数
 * @returns {Expression} 在庫状況表現
 */
export declare function createExpression(numberOfAvailableSeats: number, numberOfAllSeats: number): Expression;
/**
 * パフォーマンス在庫状況を作成する
 *
 * @export
 * @param {string} args.performaceId パフォーマンスID
 * @param {Expression} args.expression 在庫状況表現
 * @returns {IStockStatus} パフォーマンス在庫状況
 */
export declare function create(args: {
    performaceId: string;
    expression: Expression;
}): IStockStatus;
