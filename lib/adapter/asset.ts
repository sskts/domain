/**
 * 資産リポジトリ
 *
 * @class AssetAdapter
 */
import { Connection } from 'mongoose';
import assetModel from './mongoose/model/asset';

export default class AssetAdapter {
    public model: typeof assetModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(assetModel.modelName);
    }
}
