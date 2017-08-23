import { Connection } from 'mongoose';

import ClientEventModel from './mongoose/model/clientEvent';

/**
 * アプリケーションクライアントアダプター
 *
 * @class ClientAdapter
 */
export default class ClientAdapter {
    public readonly clientEventModel: typeof ClientEventModel;

    constructor(connection: Connection) {
        this.clientEventModel = connection.model(ClientEventModel.modelName);
    }
}
