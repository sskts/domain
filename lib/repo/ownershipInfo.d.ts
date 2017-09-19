/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';
export declare type IScreeningEvent = factory.event.individualScreeningEvent.IEvent;
export declare type IScreeningEventReservation = factory.reservation.event.IEventReservation<IScreeningEvent>;
export declare type IScreeningEventReservationOwnershipInfo = factory.ownershipInfo.IOwnershipInfo<IScreeningEventReservation>;
/**
 * 所有権レポジトリー
 *
 * @class OwnershipInfoRepository
 */
export declare class MongoRepository {
    readonly ownershipInfoModel: typeof ownershipInfoModel;
    constructor(connection: Connection);
    /**
     * save an ownershipInfo
     * 所有権情報を保管する
     * @param ownershipInfo ownershipInfo object
     */
    save(ownershipInfo: factory.ownershipInfo.IOwnershipInfo<any>): Promise<void>;
    /**
     * 上映イベント予約の所有権を検索する
     */
    searchScreeningEventReservation(searchConditions: {
        ownedBy?: string;
        ownedAt?: Date;
    }): Promise<IScreeningEventReservationOwnershipInfo[]>;
}
