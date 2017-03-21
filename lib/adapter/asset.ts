import { Connection } from 'mongoose';
import assetModel from './mongoose/model/asset';

/**
 * 資産アダプター
 *
 * @export
 * @class AssetAdapter
 */
export default class AssetAdapter {
    public model: typeof assetModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(assetModel.modelName);
    }
}
