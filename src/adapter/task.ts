import { Connection } from 'mongoose';
import taskModel from './mongoose/model/task';

/**
 * タスクアダプター
 *
 * @class TaskAdapter
 */
export default class TaskAdapter {
    public readonly taskModel: typeof taskModel;

    constructor(connection: Connection) {
        this.taskModel = connection.model(taskModel.modelName);
    }
}
