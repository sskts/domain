/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Asset from '../factory/asset';
import assetModel from './mongoose/model/asset';
export default class AssetAdapter {
    readonly connection: Connection;
    model: typeof assetModel;
    constructor(connection: Connection);
    store(asset: Asset.IAsset): Promise<void>;
}
