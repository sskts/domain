/**
 * event service
 * イベントサービス
 * @namespace service/event
 */
import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as EventRepository } from '../repo/event';
import { MongoRepository as IndividualScreeningEventItemAvailabilityRepository } from '../repo/itemAvailability/individualScreeningEvent';
export declare type IEventOperation<T> = (eventRepository: EventRepository, itemAvailability?: IndividualScreeningEventItemAvailabilityRepository) => Promise<T>;
/**
 * search individualScreeningEvents
 * @export
 * @function
 * @memberof service/event
 */
export declare function searchIndividualScreeningEvents(searchConditions: factory.event.individualScreeningEvent.ISearchConditions): IEventOperation<factory.event.individualScreeningEvent.IEventWithOffer[]>;
/**
 * find individualScreeningEvent by identifier
 * @export
 * @function
 * @memberof service/event
 */
export declare function findIndividualScreeningEventByIdentifier(identifier: string): IEventOperation<factory.event.individualScreeningEvent.IEventWithOffer>;
