/**
 * 所有者リポジトリ
 *
 * @class OwnerAdapter
 */
import { Connection } from 'mongoose';

import ownerModel from './mongoose/model/owner';

export default class OwnerAdapter {
    public model: typeof ownerModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(ownerModel.modelName);
    }
}
