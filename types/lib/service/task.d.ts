import TaskAdapter from '../adapter/task';
import * as TaskFactory from '../factory/task';
import TaskName from '../factory/taskName';
export declare type TaskOperation<T> = (taskAdapter: TaskAdapter) => Promise<T>;
export declare function executeByName(taskName: TaskName): TaskOperation<void>;
export declare function execute(task: TaskFactory.ITask): TaskOperation<void>;
/**
 * リトライ
 *
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューをリトライするか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export declare function retry(intervalInMinutes: number): TaskOperation<void>;
/**
 * 実行中止
 *
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューを中止するか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export declare function abort(intervalInMinutes: number): TaskOperation<void>;
