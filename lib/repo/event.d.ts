/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';
export declare abstract class Repository {
    abstract saveScreeningEvent(screeningEvent: factory.event.screeningEvent.IEvent): Promise<void>;
    abstract saveIndividualScreeningEvent(individualScreeningEvent: factory.event.individualScreeningEvent.IEvent): Promise<void>;
}
/**
 * イベントレポジトリー
 * @class EventRepository
 */
export declare class MongoRepository implements Repository {
    readonly eventModel: typeof eventModel;
    constructor(connection: Connection);
    /**
     * save a screening event
     * 上映イベントを保管する
     * @param screeningEvent screeningEvent object
     */
    saveScreeningEvent(screeningEvent: factory.event.screeningEvent.IEvent): Promise<void>;
    /**
     * save a individual screening event
     * 個々の上映イベントを保管する
     * @param individualScreeningEvent individualScreeningEvent object
     */
    saveIndividualScreeningEvent(individualScreeningEvent: factory.event.individualScreeningEvent.IEvent): Promise<void>;
    /**
     * 個々の上映イベントを検索する
     * @param {Object} searchConditions 検索条件
     */
    searchIndividualScreeningEvents(searchConditions: {
        branchCode?: string;
        startFrom?: Date;
        startThrough?: Date;
    }): Promise<factory.event.individualScreeningEvent.IEvent[]>;
    /**
     * identifierで上映イベントを取得する
     * @param {string} identifier
     */
    findIndividualScreeningEventByIdentifier(identifier: string): Promise<factory.event.individualScreeningEvent.IEvent>;
}
