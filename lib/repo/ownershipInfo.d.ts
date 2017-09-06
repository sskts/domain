/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';
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
}
