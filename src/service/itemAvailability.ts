/**
 * itemAvailability service
 * @namespace service.itemAvailability
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
// tslint:disable-next-line:no-require-imports no-var-requires
require('moment-timezone');

import { MongoRepository as ItemAvailabilityRepository } from '../repo/itemAvailability/individualScreeningEvent';

const debug = createDebug('sskts-domain:service:itemAvailability');

export type IItemAvailabilityOperation<T> = (itemAvailabilityRepository: ItemAvailabilityRepository) => Promise<T>;

/**
 * 劇場IDと上映日範囲から上映イベント在庫状況を更新する
 * @export
 * @function
 * @memberof service.itemAvailability
 * @param {string} locationBranchCode 上映場所枝番号(劇場コード)
 * @param {Date} startFrom 上映開始日時from
 * @param {Date} startThrough 上映開始日時through
 */
export function updateIndividualScreeningEvents(locationBranchCode: string, startFrom: Date, startThrough: Date):
    IItemAvailabilityOperation<void> {
    return async (itemAvailabilityRepository: ItemAvailabilityRepository) => {
        // COAから空席状況取得
        const countFreeSeatResult = await COA.services.reserve.countFreeSeat({
            theaterCode: locationBranchCode,
            begin: moment(startFrom).tz('Asia/Tokyo').format('YYYYMMDD'), // COAは日本時間で判断
            end: moment(startThrough).tz('Asia/Tokyo').format('YYYYMMDD') // COAは日本時間で判断
        });

        // 上映日ごとに
        await Promise.all(countFreeSeatResult.listDate.map(async (countFreeSeatDate) => {
            debug('saving individualScreeningEvent item availability... day:', countFreeSeatDate.dateJouei);
            // 上映イベントごとに空席状況を生成して保管
            await Promise.all(
                countFreeSeatDate.listPerformance.map(async (countFreeSeatPerformance) => {
                    const eventIdentifier = factory.event.individualScreeningEvent.createIdentifierFromCOA({
                        theaterCode: countFreeSeatResult.theaterCode,
                        titleCode: countFreeSeatPerformance.titleCode,
                        titleBranchNum: countFreeSeatPerformance.titleBranchNum,
                        dateJouei: countFreeSeatDate.dateJouei,
                        screenCode: countFreeSeatPerformance.screenCode,
                        timeBegin: countFreeSeatPerformance.timeBegin
                    });

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
