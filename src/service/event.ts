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
        const events = <factory.event.individualScreeningEvent.IEvent[]>await eventRepository.eventModel.find(conditions)
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
        const event = <factory.event.individualScreeningEvent.IEvent>await eventRepository.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();

        if (event === null) {
            throw new factory.errors.NotFound('individualScreeningEvent');
        }

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
