/// <reference types="mongoose" />
/**
 * task service
 * タスクサービス
 * @namespace service/task
 */
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import TaskAdapter from '../adapter/task';
export declare type TaskOperation<T> = (taskAdapter: TaskAdapter) => Promise<T>;
export declare type TaskAndConnectionOperation<T> = (taskAdapter: TaskAdapter, connection: mongoose.Connection) => Promise<T>;
/**
 * execute a task by taskName
 * タスク名でタスクをひとつ実行する
 * @param {factory.taskName} taskName タスク名
 * @export
 * @function
 * @memberof service/task
 */
export declare function executeByName(taskName: factory.taskName): TaskAndConnectionOperation<void>;
/**
 * execute a task
 * タスクを実行する
 * @param {factory.task.ITask} task タスクオブジェクト
 * @export
 * @function
 * @memberof service/task
 */
export declare function execute(task: factory.task.ITask): TaskAndConnectionOperation<void>;
/**
 * retry tasks in running status
 * 実行中ステータスのままになっているタスクをリトライする
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクをリトライするか
 * @returns {TaskOperation<void>}
 * @export
 * @function
 * @memberof service/task
 */
export declare function retry(intervalInMinutes: number): TaskOperation<void>;
/**
 * abort a task
 * トライ可能回数が0に達したタスクを実行中止する
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクを中止するか
 * @returns {TaskOperation<void>}
 * @export
 * @function
 * @memberof service/task
 */
export declare function abort(intervalInMinutes: number): TaskOperation<void>;
