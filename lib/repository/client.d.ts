/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ClientEventModel from './mongoose/model/clientEvent';
/**
 * アプリケーションクライアントレポジトリー
 *
 * @class ClientRepository
 */
export default class ClientRepository {
    readonly clientEventModel: typeof ClientEventModel;
    constructor(connection: Connection);
}
