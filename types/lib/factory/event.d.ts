/**
 * イベントファクトリー
 *
 * @namespace factory/event
 */
import * as CreativeWorkFactory from './creativeWork';
import EventStatusType from './eventStatusType';
import EventType from './eventType';
import IMultilingualString from './multilingualString';
import * as PlaceFactory from './place';
export interface IEvent {
    typeOf: EventType;
    /**
     * The identifier property represents any kind of identifier for any kind of Thing, such as ISBNs, GTIN codes, UUIDs etc.
     */
    identifier: string;
    /**
     * The name of the item.
     */
    name: IMultilingualString;
    /**
     * A description of the item.
     */
    description?: IMultilingualString;
    /**
     * The time admission will commence.
     */
    doorTime?: Date;
    /**
     * The duration of the item (movie, audio recording, event, etc.) in ISO 8601 date format.
     */
    duration?: string;
    /**
     * The end date and time of the item (in ISO 8601 date format).
     */
    endDate?: Date;
    /**
     * An eventStatus of an event represents its status; particularly useful when an event is cancelled or rescheduled.
     */
    eventStatus: EventStatusType;
    /**
     * The location of for example where the event is happening, an organization is located, or where an action takes place.
     */
    location?: PlaceFactory.IPlace;
    /**
     * The total number of individuals that may attend an event or venue.
     */
    maximumAttendeeCapacity?: number;
    /**
     * An offer to provide this item—for example, an offer to sell a product,
     * rent the DVD of a movie, perform a service, or give away tickets to an event.
     */
    /**
     * The number of attendee places for an event that remain unallocated.
     */
    remainingAttendeeCapacity?: number;
    /**
     * The start date and time of the item (in ISO 8601 date format).
     */
    startDate?: Date;
    /**
     * A work performed in some event, for example a play performed in a TheaterEvent.
     */
    workPerformed?: CreativeWorkFactory.ICreativeWork;
}
export declare function create(args: {
    typeOf: EventType;
    identifier: string;
    name: IMultilingualString;
    description?: IMultilingualString;
    doorTime?: Date;
    duration?: string;
    endDate?: Date;
    eventStatus: EventStatusType;
    location?: PlaceFactory.IPlace;
    maximumAttendeeCapacity?: number;
    remainingAttendeeCapacity?: number;
    startDate?: Date;
    workPerformed?: CreativeWorkFactory.ICreativeWork;
}): IEvent;
