import { Connection } from 'mongoose';
import ownerModel from './mongoose/model/owner';

/**
 * 所有者アダプター
 *
 * @export
 * @class OwnerAdapter
 */
export default class OwnerAdapter {
    public model: typeof ownerModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(ownerModel.modelName);
    }
}
