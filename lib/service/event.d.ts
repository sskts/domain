import * as factory from '@motionpicture/sskts-factory';
import EventRepository from '../repository/event';
import IndividualScreeningEventItemAvailabilityRepository from '../repository/itemAvailability/individualScreeningEvent';
import PlaceRepository from '../repository/place';
export declare type IEventOperation<T> = (eventRepository: EventRepository, itemAvailability?: IndividualScreeningEventItemAvailabilityRepository) => Promise<T>;
/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
export declare function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date): (eventRepository: EventRepository, placeRepository: PlaceRepository) => Promise<void>;
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
