import { Connection } from 'mongoose';

import ClientModel from './mongoose/model/client';
import ClientEventModel from './mongoose/model/clientEvent';

/**
 * アプリケーションクライアントアダプター
 *
 * @class ClientAdapter
 */
export default class ClientAdapter {
    public readonly clientModel: typeof ClientModel;
    public readonly clientEventModel: typeof ClientEventModel;

    constructor(connection: Connection) {
        this.clientModel = connection.model(ClientModel.modelName);
        this.clientEventModel = connection.model(ClientEventModel.modelName);
    }
}
