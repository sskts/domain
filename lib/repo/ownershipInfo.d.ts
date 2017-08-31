/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';
/**
 * 所有権レポジトリー
 *
 * @class OwnershipInfoRepository
 */
export default class OwnershipInfoRepository {
    readonly ownershipInfoModel: typeof ownershipInfoModel;
    constructor(connection: Connection);
}
