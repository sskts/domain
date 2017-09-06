import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';

/**
 * 所有権レポジトリー
 *
 * @class OwnershipInfoRepository
 */
export class MongoRepository {
    public readonly ownershipInfoModel: typeof ownershipInfoModel;

    constructor(connection: Connection) {
        this.ownershipInfoModel = connection.model(ownershipInfoModel.modelName);
    }

    /**
     * save an ownershipInfo
     * 所有権情報を保管する
     * @param ownershipInfo ownershipInfo object
     */
    public async save(ownershipInfo: factory.ownershipInfo.IOwnershipInfo<any>) {
        await this.ownershipInfoModel.findOneAndUpdate(
            {
                identifier: ownershipInfo.identifier
            },
            ownershipInfo,
            { upsert: true }
        ).exec();
    }
}
