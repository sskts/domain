import PerformanceStockStatusAdapter from '../adapter/stockStatus/performance';
export declare type PerformanceStockStatusOperation<T> = (performanceStockStatusAdapter: PerformanceStockStatusAdapter) => Promise<T>;
/**
 * 劇場IDと上映日範囲からパフォーマンス在庫状況を更新する
 *
 * @param {string} theaterCode 劇場コード
 * @param {string} dayStart 開始上映日(YYYYMMDD)
 * @param {string} dayEnd 終了上映日(YYYYMMDD)
 */
export declare function updatePerformanceStockStatuses(theaterCode: string, dayStart: string, dayEnd: string): PerformanceStockStatusOperation<void>;
