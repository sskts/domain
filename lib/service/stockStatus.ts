/**
 * 在庫状況サービス
 *
 * @namespace service/stockStatus
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';

import * as PerformanceStockStatusFactory from '../factory/stockStatus/performance';

import PerformanceStockStatusAdapter from '../adapter/stockStatus/performance';

const debug = createDebug('sskts-domain:service:stockStatus');

export type PerformanceStockStatusOperation<T> = (performanceStockStatusAdapter: PerformanceStockStatusAdapter) => Promise<T>;

/**
 * 劇場IDと上映日範囲からパフォーマンス在庫状況を更新する
 *
 * @param {string} theaterCode 劇場コード
 * @param {string} dayStart 開始上映日(YYYYMMDD)
 * @param {string} dayEnd 終了上映日(YYYYMMDD)
 */
export function updatePerformanceStockStatuses(theaterCode: string, dayStart: string, dayEnd: string):
    PerformanceStockStatusOperation<void> {
    return async (performanceStockStatusAdapter: PerformanceStockStatusAdapter) => {
        // COAから空席状況取得
        const countFreeSeatResult = await COA.services.reserve.countFreeSeat({
            theater_code: theaterCode,
            begin: dayStart,
            end: dayEnd
        });

        // 上映日ごとに
        await Promise.all(countFreeSeatResult.list_date.map(async (countFreeSeatDate) => {
            debug('saving performance stock status... day:', countFreeSeatDate.date_jouei);
            // パフォーマンスごとに空席状況を生成して保管
            await Promise.all(
                countFreeSeatDate.list_performance.map(async (countFreeSeatPerformance) => {
                    const performanceId = [ // todo ID生成メソッドを利用する
                        countFreeSeatResult.theater_code,
                        countFreeSeatPerformance.title_code,
                        countFreeSeatPerformance.title_branch_num,
                        countFreeSeatDate.date_jouei,
                        countFreeSeatPerformance.screen_code,
                        countFreeSeatPerformance.time_begin
                    ].join('');

                    const stockStatusExpression = PerformanceStockStatusFactory.createExpression(
                        countFreeSeatPerformance.cnt_reserve_free,
                        countFreeSeatPerformance.cnt_reserve_max
                    );

                    // 永続化
                    debug('saving performance stock status... id:', performanceId);
                    await performanceStockStatusAdapter.updateOne(
                        countFreeSeatDate.date_jouei,
                        performanceId,
                        stockStatusExpression
                    );
                    debug('performance stock status saved');
                })
            );
        }));
    };
}
