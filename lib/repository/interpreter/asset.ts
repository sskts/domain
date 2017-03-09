/**
 * 資産リポジトリ
 *
 * @class AssetRepositoryInterpreter
 */

import * as clone from 'clone';
import { Connection } from 'mongoose';
import * as Asset from '../../model/asset';
import AssetRepository from '../asset';
import assetModel from './mongoose/model/asset';

export default class AssetRepositoryInterpreter implements AssetRepository {
    private model: typeof assetModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(assetModel.modelName);
    }

    public async store(asset: Asset.IAsset) {
        const update = clone(asset, false);
        (<any>update).ownership._id = update.ownership.id; // 子オブジェクトのidは_idに変換の必要あり
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
