/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import assetModel from './mongoose/model/asset';
/**
 * 資産アダプター
 *
 * @export
 * @class AssetAdapter
 */
export default class AssetAdapter {
    model: typeof assetModel;
    private readonly connection;
    constructor(connection: Connection);
}
