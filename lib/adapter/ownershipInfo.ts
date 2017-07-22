import { Connection } from 'mongoose';
import ownershipInfoModel from './mongoose/model/ownershipInfo';

/**
 * 所有権アダプター
 *
 * @class OwnershipInfoAdapter
 */
export default class OwnershipInfoAdapter {
    public readonly ownershipInfoModel: typeof ownershipInfoModel;

    constructor(connection: Connection) {
        this.ownershipInfoModel = connection.model(ownershipInfoModel.modelName);
    }
}
