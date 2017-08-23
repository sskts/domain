/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import screenModel from './mongoose/model/screen';
/**
 * スクリーンアダプター
 *
 * @class ScreenAdapter
 */
export default class ScreenAdapter {
    readonly model: typeof screenModel;
    constructor(connection: Connection);
}
