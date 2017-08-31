import { Connection } from 'mongoose';

import ClientEventModel from './mongoose/model/clientEvent';

/**
 * アプリケーションクライアントレポジトリー
 *
 * @class ClientRepository
 */
export default class ClientRepository {
    public readonly clientEventModel: typeof ClientEventModel;

    constructor(connection: Connection) {
        this.clientEventModel = connection.model(ClientEventModel.modelName);
    }
}
