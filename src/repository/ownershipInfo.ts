import { Connection } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';

/**
 * 所有権レポジトリー
 *
 * @class OwnershipInfoRepository
 */
export default class OwnershipInfoRepository {
    public readonly ownershipInfoModel: typeof ownershipInfoModel;

    constructor(connection: Connection) {
        this.ownershipInfoModel = connection.model(ownershipInfoModel.modelName);
    }
}
