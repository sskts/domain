/**
 * itemAvailability service
 * @namespace service/itemAvailability
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import IndividualScreeningEventItemAvailabilityRepository from '../repository/itemAvailability/individualScreeningEvent';

const debug = createDebug('sskts-domain:service:itemAvailability');

export type IItemAvailabilityOperation<T> = (
    itemAvailabilityRepository: IndividualScreeningEventItemAvailabilityRepository
) => Promise<T>;

/**
 * 劇場IDと上映日範囲からパフォーマンス在庫状況を更新する
 *
 * @param {string} theaterCode 劇場コード
 * @param {string} dayStart 開始上映日(YYYYMMDD)
 * @param {string} dayEnd 終了上映日(YYYYMMDD)
 */
export function updatePerformanceStockStatuses(theaterCode: string, dayStart: string, dayEnd: string):
    IItemAvailabilityOperation<void> {
    return async (itemAvailabilityRepository: IndividualScreeningEventItemAvailabilityRepository) => {
        // COAから空席状況取得
        const countFreeSeatResult = await COA.services.reserve.countFreeSeat({
            theaterCode: theaterCode,
            begin: dayStart,
            end: dayEnd
        });

        // 上映日ごとに
        await Promise.all(countFreeSeatResult.listDate.map(async (countFreeSeatDate) => {
            debug('saving individualScreeningEvent item availability... day:', countFreeSeatDate.dateJouei);
            // パフォーマンスごとに空席状況を生成して保管
            await Promise.all(
                countFreeSeatDate.listPerformance.map(async (countFreeSeatPerformance) => {
                    // tslint:disable-next-line:no-suspicious-comment
                    // TODO ID生成メソッドを利用する
                    const eventIdentifier = [
                        countFreeSeatResult.theaterCode,
                        countFreeSeatPerformance.titleCode,
                        countFreeSeatPerformance.titleBranchNum,
                        countFreeSeatDate.dateJouei,
                        countFreeSeatPerformance.screenCode,
                        countFreeSeatPerformance.timeBegin
                    ].join('');

                    const itemAvailability = factory.event.individualScreeningEvent.createItemAvailability(
                        countFreeSeatPerformance.cntReserveFree,
                        countFreeSeatPerformance.cntReserveMax
                    );

                    // 永続化
                    debug('saving item availability... identifier:', eventIdentifier);
                    await itemAvailabilityRepository.updateOne(
                        countFreeSeatDate.dateJouei,
                        eventIdentifier,
                        itemAvailability
                    );
                    debug('item availability saved');
                })
            );
        }));
    };
}
