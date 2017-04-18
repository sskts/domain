import { Connection } from 'mongoose';
import queueModel from './mongoose/model/queue';

/**
 * キューアダプター
 *
 * @class QueueAdapter
 */
export default class QueueAdapter {
    public readonly model: typeof queueModel;

    constructor(connection: Connection) {
        this.model = connection.model(queueModel.modelName);
    }
}
