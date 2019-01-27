/**
 * 注文アイテムの在庫状況を表現するサービス
 * @namespace service.itemAvailability
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as moment from 'moment-timezone';

import { MongoRepository as ItemAvailabilityRepository } from '../repo/itemAvailability/screeningEvent';

import * as factory from '../factory';

const debug = createDebug('sskts-domain:service:itemAvailability');

export type IItemAvailabilityOperation<T> = (repos: { itemAvailability: ItemAvailabilityRepository }) => Promise<T>;

/**
 * 劇場IDと上映日範囲から上映イベント在庫状況を更新する
 */
export function updateIndividualScreeningEvents(locationBranchCode: string, startFrom: Date, startThrough: Date):
    IItemAvailabilityOperation<void> {
    return async (repos: { itemAvailability: ItemAvailabilityRepository }) => {
        // COAから空席状況取得
        const countFreeSeatResult = await COA.services.reserve.countFreeSeat({
            theaterCode: locationBranchCode,
            begin: moment(startFrom).tz('Asia/Tokyo').format('YYYYMMDD'), // COAは日本時間で判断
            end: moment(startThrough).tz('Asia/Tokyo').format('YYYYMMDD') // COAは日本時間で判断
        });

        // 上映日ごとに
        await Promise.all(countFreeSeatResult.listDate.map(async (countFreeSeatDate) => {
            debug('saving screeningEvent item availability... day:', countFreeSeatDate.dateJouei);
            // 上映イベントごとに空席状況を生成して保管
            await Promise.all(
                countFreeSeatDate.listPerformance.map(async (countFreeSeatPerformance) => {
                    const eventIdentifier = factory.event.screeningEvent.createIdentifierFromCOA({
                        theaterCode: countFreeSeatResult.theaterCode,
                        titleCode: countFreeSeatPerformance.titleCode,
                        titleBranchNum: countFreeSeatPerformance.titleBranchNum,
                        dateJouei: countFreeSeatDate.dateJouei,
                        screenCode: countFreeSeatPerformance.screenCode,
                        timeBegin: countFreeSeatPerformance.timeBegin
                    });

                    const itemAvailability = createItemAvailability(
                        // COAからのレスポンスが負の値の場合があるので調整
                        Math.max(0, countFreeSeatPerformance.cntReserveFree),
                        Math.max(0, countFreeSeatPerformance.cntReserveMax)
                    );

                    // 永続化
                    debug('saving item availability... identifier:', eventIdentifier);
                    await repos.itemAvailability.updateOne(
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

/**
 * 座席数から在庫状況表現を生成する
 * @param numberOfAvailableSeats 空席数
 * @param numberOfAllSeats 全座席数
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function createItemAvailability(
    numberOfAvailableSeats: number, numberOfAllSeats: number
): factory.event.screeningEvent.IItemAvailability {
    if (numberOfAllSeats === 0) {
        return 0;
    }

    // 残席数より空席率を算出
    // tslint:disable-next-line:no-magic-numbers
    return Math.floor(numberOfAvailableSeats / numberOfAllSeats * 100);
}
