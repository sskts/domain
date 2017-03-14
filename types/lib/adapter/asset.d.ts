/// <reference types="mongoose" />
/**
 * 資産リポジトリ
 *
 * @class AssetAdapter
 */
import { Connection } from 'mongoose';
import assetModel from './mongoose/model/asset';
export default class AssetAdapter {
    readonly connection: Connection;
    model: typeof assetModel;
    constructor(connection: Connection);
}
