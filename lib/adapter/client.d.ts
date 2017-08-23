/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ClientEventModel from './mongoose/model/clientEvent';
/**
 * アプリケーションクライアントアダプター
 *
 * @class ClientAdapter
 */
export default class ClientAdapter {
    readonly clientEventModel: typeof ClientEventModel;
    constructor(connection: Connection);
}
