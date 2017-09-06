/**
 * event service
 * イベントサービス
 * @namespace service/event
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

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
        const events = await eventRepository.searchIndividualScreeningEvents(searchConditions);

        return await Promise.all(events.map(async (event) => {
            // add item availability info
            const offer: factory.event.individualScreeningEvent.IOffer = {
                typeOf: 'Offer',
                availability: null,
                url: ''
            };
            if (itemAvailabilityRepository !== undefined) {
                offer.availability = await itemAvailabilityRepository.findOne(event.coaInfo.dateJouei, event.identifier);
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
        if (itemAvailabilityRepository !== undefined) {
            offer.availability = await itemAvailabilityRepository.findOne(event.coaInfo.dateJouei, event.identifier);
        }

        return {
            ...event,
            ...{
                offer: offer
            }
        };
    };
}
