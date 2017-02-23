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
    constructor(readonly connection: Connection) {
    }

    public async store(asset: Asset) {
        const model = this.connection.model(assetModel.modelName);
        await model.findByIdAndUpdate(asset.id, asset, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
