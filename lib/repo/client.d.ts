/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import ClientEventModel from './mongoose/model/clientEvent';
/**
 * アプリケーションクライアントレポジトリー
 * @class respository.client
 */
export declare class MongoRepository {
    readonly clientEventModel: typeof ClientEventModel;
    constructor(connection: mongoose.Connection);
    pushEvent(clientAttributes: factory.clientEvent.IAttributes): Promise<factory.clientEvent.IClientEvent>;
}
