import { Connection } from 'mongoose';
import ownerModel from './mongoose/model/owner';

/**
 * 所有者アダプター
 *
 * @class OwnerAdapter
 */
export default class OwnerAdapter {
    public readonly model: typeof ownerModel;

    constructor(connection: Connection) {
        this.model = connection.model(ownerModel.modelName);
    }
}
