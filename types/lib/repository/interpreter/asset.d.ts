/// <reference types="mongoose" />
/**
 * 資産リポジトリ
 *
 * @class AssetRepositoryInterpreter
 */
import { Connection } from 'mongoose';
import Asset from '../../model/asset';
import AssetRepository from '../asset';
export default class AssetRepositoryInterpreter implements AssetRepository {
    readonly connection: Connection;
    constructor(connection: Connection);
    store(asset: Asset): Promise<void>;
}
