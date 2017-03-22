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
    readonly model: typeof assetModel;
    constructor(connection: Connection);
}
