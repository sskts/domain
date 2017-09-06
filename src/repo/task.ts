import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import taskModel from './mongoose/model/task';

/**
 * タスクレポジトリー
 *
 * @class TaskRepository
 */
export class MongoRepository {
    public readonly taskModel: typeof taskModel;

    constructor(connection: Connection) {
        this.taskModel = connection.model(taskModel.modelName);
    }

    public async save(task: factory.task.ITask) {
        await this.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
    }
}
