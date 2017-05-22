/**
 * パフォーマンス在庫状況ファクトリー
 * todo jsdoc
 *
 * @namespace factory/performanceStockStatus
 */

import * as moment from 'moment';

export type IPerformanceStockStatus =
    '○'
    | '△'
    | '×'
    | '-'
    ;

export namespace IPerformanceStockStatus {
    export const MANY = '○';
    export const FEW = '△';
    export const UNAVAILABLE = '×';
    export const EXPIRED = '-';
}

export function create(day: string, numberOfAvailableSeats: number, numberOfAllSeats: number): IPerformanceStockStatus {
    // 上映日当日過ぎていれば期限切れ
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(day, 10) < parseInt(moment().format('YYYYMMDD'), 10)) {
        return IPerformanceStockStatus.EXPIRED;
    }

    // 残席数よりステータスを算出
    // tslint:disable-next-line:no-magic-numbers
    if (30 * numberOfAllSeats < 100 * numberOfAvailableSeats) {
        return IPerformanceStockStatus.MANY;
    }
    if (0 < numberOfAvailableSeats) {
        return IPerformanceStockStatus.FEW;
    }

    // 残席0以下なら問答無用に×
    return IPerformanceStockStatus.UNAVAILABLE;
}
