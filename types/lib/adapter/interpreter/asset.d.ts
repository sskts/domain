/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import * as Asset from '../../factory/asset';
import AssetAdapter from '../asset';
export default class AssetAdapterInterpreter implements AssetAdapter {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    store(asset: Asset.IAsset): Promise<void>;
}
