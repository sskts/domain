/**
 * 販売情報サービス
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as EventRepository } from '../repo/event';
import { MongoRepository as IndividualScreeningEventItemAvailabilityRepository } from '../repo/itemAvailability/individualScreeningEvent';

const debug = createDebug('sskts-domain:service:offer');

export type IEventOperation<T> = (
    eventRepository: EventRepository,
    itemAvailability?: IndividualScreeningEventItemAvailabilityRepository
) => Promise<T>;

/**
 * 個々の上映イベントを検索する
 * 在庫状況リポジトリーをパラメーターとして渡せば、在庫状況も取得してくれる
 * @export
 */
export function searchIndividualScreeningEvents(
    searchConditions: factory.event.individualScreeningEvent.ISearchConditions
): IEventOperation<factory.event.individualScreeningEvent.IEventWithOffer[]> {
    return async (
        eventRepository: EventRepository,
        itemAvailabilityRepository?: IndividualScreeningEventItemAvailabilityRepository
    ) => {
        debug('finding individualScreeningEvents...', searchConditions);
        const events = await eventRepository.searchIndividualScreeningEvents(searchConditions);

        return Promise.all(events.map(async (event) => {
            // 空席状況情報を追加
            const offer: factory.event.individualScreeningEvent.IOffer = {
                typeOf: 'Offer',
                availability: null,
                url: ''
            };
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (itemAvailabilityRepository !== undefined) {
                offer.availability = await itemAvailabilityRepository.findOne(event.coaInfo.dateJouei, event.identifier);
            }

            return { ...event, ...{ offer: offer } };
        }));
    };
}

/**
 * 個々の上映イベントを識別子で取得する
 * @export
 */
export function findIndividualScreeningEventByIdentifier(
    identifier: string
): IEventOperation<factory.event.individualScreeningEvent.IEventWithOffer> {
    return async (
        eventRepository: EventRepository,
        itemAvailabilityRepository?: IndividualScreeningEventItemAvailabilityRepository
    ) => {
        const event = await eventRepository.findIndividualScreeningEventByIdentifier(identifier);

        // add item availability info
        const offer: factory.event.individualScreeningEvent.IOffer = {
            typeOf: 'Offer',
            availability: null,
            url: ''
        };
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (itemAvailabilityRepository !== undefined) {
            offer.availability = await itemAvailabilityRepository.findOne(event.coaInfo.dateJouei, event.identifier);
        }

        return { ...event, ...{ offer: offer } };
    };
}
