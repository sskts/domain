/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import screenModel from './mongoose/model/screen';
/**
 * スクリーンアダプター
 *
 * @export
 * @class ScreenAdapter
 */
export default class ScreenAdapter {
    model: typeof screenModel;
    private readonly connection;
    constructor(connection: Connection);
}
