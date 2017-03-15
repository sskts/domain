/// <reference types="mongoose" />
/**
 * スクリーンアダプター
 *
 * @class ScreenAdapter
 */
import { Connection } from 'mongoose';
import screenModel from './mongoose/model/screen';
export default class ScreenAdapter {
    readonly connection: Connection;
    model: typeof screenModel;
    constructor(connection: Connection);
}
