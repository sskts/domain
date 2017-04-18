import { Connection } from 'mongoose';
import assetModel from './mongoose/model/asset';

/**
 * 資産アダプター
 *
 * @class AssetAdapter
 */
export default class AssetAdapter {
    public readonly model: typeof assetModel;

    constructor(connection: Connection) {
        this.model = connection.model(assetModel.modelName);
    }
}
