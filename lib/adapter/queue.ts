/**
 * キューアダプター
 *
 * @class QueueAdapter
 */
import { Connection } from 'mongoose';
import queueModel from './mongoose/model/queue';

export default class QueueAdapter {
    public model: typeof queueModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(queueModel.modelName);
    }
}
