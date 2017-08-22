/// <reference types="mongoose" />
/**
 * タスクサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/task
 */
import * as factory from '@motionpicture/sskts-factory';
import * as mongoose from 'mongoose';
import TaskAdapter from '../adapter/task';
export declare type TaskOperation<T> = (taskAdapter: TaskAdapter) => Promise<T>;
export declare type TaskAndConnectionOperation<T> = (taskAdapter: TaskAdapter, connection: mongoose.Connection) => Promise<T>;
export declare function executeByName(taskName: factory.taskName): TaskAndConnectionOperation<void>;
export declare function execute(task: factory.task.ITask): TaskAndConnectionOperation<void>;
/**
 * リトライ
 *
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクをリトライするか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export declare function retry(intervalInMinutes: number): TaskOperation<void>;
/**
 * 実行中止
 *
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクを中止するか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export declare function abort(intervalInMinutes: number): TaskOperation<void>;
