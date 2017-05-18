/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ClientModel from './mongoose/model/client';
import ClientEventModel from './mongoose/model/clientEvent';
/**
 * アプリケーションクライアントアダプター
 *
 * @class ClientAdapter
 */
export default class ClientAdapter {
    readonly clientModel: typeof ClientModel;
    readonly clientEventModel: typeof ClientEventModel;
    constructor(connection: Connection);
}
