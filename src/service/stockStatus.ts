/**
 * 在庫状況サービス
 *
 * @namespace service/stockStatus
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

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
            theaterCode: theaterCode,
            begin: dayStart,
            end: dayEnd
        });

        // 上映日ごとに
        await Promise.all(countFreeSeatResult.listDate.map(async (countFreeSeatDate) => {
            debug('saving performance stock status... day:', countFreeSeatDate.dateJouei);
            // パフォーマンスごとに空席状況を生成して保管
            await Promise.all(
                countFreeSeatDate.listPerformance.map(async (countFreeSeatPerformance) => {
                    const performanceId = [ // todo ID生成メソッドを利用する
                        countFreeSeatResult.theaterCode,
                        countFreeSeatPerformance.titleCode,
                        countFreeSeatPerformance.titleBranchNum,
                        countFreeSeatDate.dateJouei,
                        countFreeSeatPerformance.screenCode,
                        countFreeSeatPerformance.timeBegin
                    ].join('');

                    const stockStatusExpression = factory.stockStatus.performance.createExpression(
                        countFreeSeatPerformance.cntReserveFree,
                        countFreeSeatPerformance.cntReserveMax
                    );

                    // 永続化
                    debug('saving performance stock status... id:', performanceId);
                    await performanceStockStatusAdapter.updateOne(
                        countFreeSeatDate.dateJouei,
                        performanceId,
                        stockStatusExpression
                    );
                    debug('performance stock status saved');
                })
            );
        }));
    };
}
