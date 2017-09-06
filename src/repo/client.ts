import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';

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
export class MongoRepository {
    public readonly clientEventModel: typeof ClientEventModel;

    constructor(connection: mongoose.Connection) {
        this.clientEventModel = connection.model(ClientEventModel.modelName);
    }

    public async pushEvent(params: IPushEventParams): Promise<factory.clientEvent.IClientEvent> {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO クライアントの存在確認

        // イベント作成
        const clientEvent = factory.clientEvent.create({ ...params, ...{ id: mongoose.Types.ObjectId().toString() } });

        // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
        await this.clientEventModel.findByIdAndUpdate(clientEvent.id, clientEvent, { upsert: true }).exec();

        return clientEvent;
    }
}
