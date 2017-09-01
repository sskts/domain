/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import ClientEventModel from './mongoose/model/clientEvent';
export interface IPushEventParams {
    client: string;
    occurredAt: Date;
    url?: string;
    label: string;
    category?: string;
    action?: string;
    message?: string;
    notes?: string;
    useragent?: string;
    location?: number[];
    transaction?: string;
}
/**
 * アプリケーションクライアントレポジトリー
 *
 * @class ClientRepository
 */
export default class ClientRepository {
    readonly clientEventModel: typeof ClientEventModel;
    constructor(connection: Connection);
    pushEvent(params: IPushEventParams): Promise<factory.clientEvent.IClientEvent>;
}
