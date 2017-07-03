/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import taskModel from './mongoose/model/task';
/**
 * タスクアダプター
 *
 * @class TaskAdapter
 */
export default class TaskAdapter {
    readonly taskModel: typeof taskModel;
    constructor(connection: Connection);
}
