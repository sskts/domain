/**
 * event service
 * イベントサービス
 * @namespace service/event
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { MongoRepository as EventRepository } from '../repo/event';
import { MongoRepository as IndividualScreeningEventItemAvailabilityRepository } from '../repo/itemAvailability/individualScreeningEvent';

const debug = createDebug('sskts-domain:service:event');

export type IEventOperation<T> = (
    eventRepository: EventRepository,
    itemAvailability?: IndividualScreeningEventItemAvailabilityRepository
) => Promise<T>;

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
        eventRepository: EventRepository,
        itemAvailabilityRepository?: IndividualScreeningEventItemAvailabilityRepository
    ) => {
        debug('finding individualScreeningEvents...', searchConditions);
        const conditions = {
            branchCode: searchConditions.theater,
            startFrom: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').toDate(),
            startThrough: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').add(1, 'day').toDate()
        };
        const events = await eventRepository.searchIndividualScreeningEvents(conditions);

        return await Promise.all(events.map(async (event) => {
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

            const eventWithOffer = {
                ...{
                    offer: offer
                },
                ...event
            };
            debug('eventWithOffer:', eventWithOffer);

            return eventWithOffer;
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

        const eventWithOffer = {
            ...{
                offer: offer
            },
            ...event
        };
        debug('eventWithOffer:', eventWithOffer);

        return eventWithOffer;
    };
}
