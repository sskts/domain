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
    save(taskAttributes: factory.task.IAttributes): Promise<factory.task.ITask>;
    executeOneByName(taskName: factory.taskName): Promise<factory.task.ITask>;
    retry(intervalInMinutes: number): Promise<void>;
    abortOne(intervalInMinutes: number): Promise<factory.task.ITask>;
    pushExecutionResultById(id: string, status: factory.taskStatus, executionResult: factory.taskExecutionResult.IAttributes): Promise<void>;
}
