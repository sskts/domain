import { Connection } from 'mongoose';
import taskModel from './mongoose/model/task';

/**
 * タスクレポジトリー
 *
 * @class TaskRepository
 */
export default class TaskRepository {
    public readonly taskModel: typeof taskModel;

    constructor(connection: Connection) {
        this.taskModel = connection.model(taskModel.modelName);
    }
}
