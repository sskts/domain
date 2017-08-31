/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import taskModel from './mongoose/model/task';
/**
 * タスクレポジトリー
 *
 * @class TaskRepository
 */
export default class TaskRepository {
    readonly taskModel: typeof taskModel;
    constructor(connection: Connection);
}
