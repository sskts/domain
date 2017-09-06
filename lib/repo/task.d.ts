/// <reference types="mongoose" />
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import taskModel from './mongoose/model/task';
/**
 * タスクレポジトリー
 *
 * @class TaskRepository
 */
export declare class MongoRepository {
    readonly taskModel: typeof taskModel;
    constructor(connection: Connection);
    save(task: factory.task.ITask): Promise<void>;
}
