/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Asset from '../../model/asset';
import AssetRepository from '../asset';
export default class AssetRepositoryInterpreter implements AssetRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    store(asset: Asset.IAsset): Promise<void>;
}
