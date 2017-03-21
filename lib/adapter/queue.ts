import { Connection } from 'mongoose';
import queueModel from './mongoose/model/queue';

/**
 * キューアダプター
 *
 * @export
 * @class QueueAdapter
 */
export default class QueueAdapter {
    public model: typeof queueModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(queueModel.modelName);
    }
}
