/**
 * 資産リポジトリ
 *
 * @class AssetRepositoryInterpreter
 */

import { Connection } from 'mongoose';
import Asset from '../../model/asset';
import AssetRepository from '../asset';
import assetModel from './mongoose/model/asset';

export default class AssetRepositoryInterpreter implements AssetRepository {
    private model: typeof assetModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(assetModel.modelName);
    }

    public async store(asset: Asset) {
        await this.model.findByIdAndUpdate(asset.id, asset, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
