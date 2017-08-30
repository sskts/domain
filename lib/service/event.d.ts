import * as factory from '@motionpicture/sskts-factory';
import EventAdapter from '../adapter/event';
import IndividualScreeningEventItemAvailabilityAdapter from '../adapter/itemAvailability/individualScreeningEvent';
import PlaceAdapter from '../adapter/place';
export declare type IEventOperation<T> = (eventAdapter: EventAdapter, itemAvailability?: IndividualScreeningEventItemAvailabilityAdapter) => Promise<T>;
/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
export declare function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date): (eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => Promise<void>;
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
