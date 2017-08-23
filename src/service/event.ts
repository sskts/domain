/**
 * イベントサービス
 *
 * @namespace service/event
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import EventAdapter from '../adapter/event';
import IndividualScreeningEventItemAvailabilityAdapter from '../adapter/itemAvailability/individualScreeningEvent';
import PlaceAdapter from '../adapter/place';

const debug = createDebug('sskts-domain:service:event');

export type IEventOperation<T> = (
    eventAdapter: EventAdapter,
    itemAvailability?: IndividualScreeningEventItemAvailabilityAdapter
) => Promise<T>;

/**
 * 上映イベントインポート
 * @export
 * @function
 * @memberof service/event
 */
export function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date) {
    return async (eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => {
        // 劇場取得
        const movieTheaterDoc = await placeAdapter.placeModel.findOne(
            {
                branchCode: theaterCode,
                typeOf: factory.placeType.MovieTheater
            }
        ).exec();
        if (movieTheaterDoc === null) {
            throw new ArgumentError('movieTheater not found.');
        }
        const movieTheater = <factory.place.movieTheater.IPlace>movieTheaterDoc.toObject();

        // COAから作品取得
        const filmsFromCOA = await COA.services.master.title({
            theaterCode: theaterCode
        });

        // COAからパフォーマンス取得
        const schedulesFromCOA = await COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });

        // 永続化
        const screeningEvents = await Promise.all(filmsFromCOA.map(async (filmFromCOA) => {
            const screeningEvent = factory.event.screeningEvent.createFromCOA(filmFromCOA)(movieTheater);
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            await eventAdapter.eventModel.findOneAndUpdate(
                {
                    identifier: screeningEvent.identifier,
                    typeOf: factory.eventType.ScreeningEvent
                },
                screeningEvent,
                { upsert: true }
            ).exec();
            debug('screeningEvent stored.');

            return screeningEvent;
        }));

        // パフォーマンスごとに永続化トライ
        await Promise.all(schedulesFromCOA.map(async (scheduleFromCOA) => {
            const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier(
                theaterCode, scheduleFromCOA.titleCode, scheduleFromCOA.titleBranchNum
            );

            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find(
                (place) => place.branchCode === scheduleFromCOA.screenCode
            );
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', scheduleFromCOA.screenCode);

                return;
            }

            // 上映イベント取得
            const screeningEvent = screeningEvents.find((event) => event.identifier === screeningEventIdentifier);
            if (screeningEvent === undefined) {
                console.error('screeningEvent not found.', screeningEventIdentifier);

                return;
            }

            // 永続化
            const individualScreeningEvent = factory.event.individualScreeningEvent.createFromCOA(
                scheduleFromCOA
            )(screenRoom, screeningEvent);
            debug('storing individualScreeningEvent', individualScreeningEvent);
            await eventAdapter.eventModel.findOneAndUpdate(
                {
                    identifier: individualScreeningEvent.identifier,
                    typeOf: factory.eventType.IndividualScreeningEvent
                },
                individualScreeningEvent,
                { new: true, upsert: true }
            ).exec();
            debug('individualScreeningEvent stored.');
        }));
    };
}

/**
 * search individualScreeningEvents
 * @export
 * @function
 * @memberof service/event
 */
export function searchIndividualScreeningEvents(
    searchConditions: factory.event.individualScreeningEvent.ISearchConditions
): IEventOperation<factory.event.individualScreeningEvent.IEventWithOffer[]> {
    return async (
        eventAdapter: EventAdapter,
        itemAvailabilityAdapter?: IndividualScreeningEventItemAvailabilityAdapter
    ) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: factory.eventType.IndividualScreeningEvent
        };

        if (searchConditions.day !== undefined) {
            conditions.startDate = {
                $gte: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').toDate(),
                $lt: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').add(1, 'day').toDate()
            };
        }

        if (searchConditions.theater !== undefined) {
            conditions['superEvent.location.branchCode'] = searchConditions.theater;
        }

        debug('finding individualScreeningEvents...', conditions);
        const events = <factory.event.individualScreeningEvent.IEvent[]>await eventAdapter.eventModel.find(conditions)
            .sort({ startDate: 1 })
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();

        return await Promise.all(events.map(async (event) => {
            // add item availability info
            const offer: factory.event.individualScreeningEvent.IOffer = {
                typeOf: 'Offer',
                availability: null,
                url: ''
            };
            if (itemAvailabilityAdapter !== undefined) {
                offer.availability = await itemAvailabilityAdapter.findOne(event.coaInfo.dateJouei, event.identifier);
            }

            return {
                ...event,
                ...{
                    offer: offer
                }
            };
        }));
    };
}

/**
 * find individualScreeningEvent by identifier
 * @export
 * @function
 * @memberof service/event
 */
export function findIndividualScreeningEventByIdentifier(
    identifier: string
): IEventOperation<monapt.Option<factory.event.individualScreeningEvent.IEventWithOffer>> {
    return async (
        eventAdapter: EventAdapter,
        itemAvailabilityAdapter?: IndividualScreeningEventItemAvailabilityAdapter
    ) => {
        const event = <factory.event.individualScreeningEvent.IEvent>await eventAdapter.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();

        if (event === null) {
            return monapt.None;
        }

        // add item availability info
        const offer: factory.event.individualScreeningEvent.IOffer = {
            typeOf: 'Offer',
            availability: null,
            url: ''
        };
        if (itemAvailabilityAdapter !== undefined) {
            offer.availability = await itemAvailabilityAdapter.findOne(event.coaInfo.dateJouei, event.identifier);
        }

        return monapt.Option({
            ...event,
            ...{
                offer: offer
            }
        });
    };
}
