/**
 * タスクサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/task
 */

import * as createDebug from 'debug';
import * as moment from 'moment';

import TaskAdapter from '../adapter/task';

import * as TaskFactory from '../factory/task';
import * as TaskExecutionResult from '../factory/taskExecutionResult';
import TaskName from '../factory/taskName';
import TaskStatus from '../factory/taskStatus';

import * as NotificationService from './notification';
import * as TaskFunctionsService from './taskFunctions';

export type TaskOperation<T> = (taskAdapter: TaskAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:task');

/**
 * タスク実行時のソート条件
 *
 * @ignore
 */
const sortOrder4executionOfTasks = {
    count_trinumber_of_trieded: 1, // 試行回数の少なさ優先
    runs_at: 1 // 実行予定日時の早さ優先
};

export function executeByName(taskName: TaskName): TaskOperation<void> {
    return async (taskAdapter: TaskAdapter) => {
        // 未実行のタスクを取得
        const taskDoc = await taskAdapter.taskModel.findOneAndUpdate(
            {
                status: TaskStatus.Ready,
                runs_at: { $lt: new Date() },
                name: taskName
            },
            {
                status: TaskStatus.Running, // 実行中に変更
                last_tried_at: new Date(),
                $inc: { number_of_tried: 1 } // トライ回数増やす
            },
            { new: true }
        ).sort(sortOrder4executionOfTasks).exec();
        debug('taskDoc found', taskDoc);

        // タスクがなければ終了
        if (taskDoc === null) {
            return;
        }

        const task = <TaskFactory.ITask>taskDoc.toObject();

        try {
            // タスク名の関数が定義されていることが必須
            if (typeof (<any>TaskFunctionsService)[taskName] !== 'function') {
                throw new TypeError(`function undefined ${taskName}`);
            }

            await (<any>TaskFunctionsService)[taskName](task.data);

            const result = TaskExecutionResult.create({
                executed_at: new Date(),
                error: ''
            });
            await taskAdapter.taskModel.findByIdAndUpdate(
                task.id,
                {
                    status: TaskStatus.Executed,
                    $push: { execution_results: result }
                }
            ).exec();
        } catch (error) {
            // 失敗してもここでは戻さない(Runningのまま待機)
            // 実行結果追加
            const result = TaskExecutionResult.create({
                executed_at: new Date(),
                error: error.stack
            });
            await taskAdapter.taskModel.findByIdAndUpdate(
                task.id,
                { $push: { execution_results: result } }
            ).exec();
        }
    };
}

/**
 * リトライ
 *
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューをリトライするか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export function retry(intervalInMinutes: number): TaskOperation<void> {
    return async (taskAdapter: TaskAdapter) => {
        await taskAdapter.taskModel.update(
            {
                status: TaskStatus.Running,
                last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
                // tslint:disable-next-line:no-invalid-this space-before-function-paren
                $where: function (this: any) { return (this.max_number_of_try > this.number_of_tried); }
            },
            {
                status: TaskStatus.Ready // 実行前に変更
            },
            { multi: true }
        ).exec();
    };
}

/**
 * 実行中止
 *
 * @param {number} intervalInMinutes 最終試行日時から何分経過したキューを中止するか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export function abort(intervalInMinutes: number): TaskOperation<void> {
    return async (taskAdapter: TaskAdapter) => {
        const abortedTaskDoc = await taskAdapter.taskModel.findOneAndUpdate(
            {
                status: TaskStatus.Running,
                last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
                // tslint:disable-next-line:no-invalid-this space-before-function-paren
                $where: function (this: any) { return (this.max_number_of_try === this.number_of_tried); }
            },
            {
                status: TaskStatus.Aborted
            },
            { new: true }
        ).exec();
        debug('abortedTaskDoc found', abortedTaskDoc);

        if (abortedTaskDoc === null) {
            return;
        }

        // メール通知
        const results = <string[]>abortedTaskDoc.get('execution_results');
        const data = abortedTaskDoc.get('data');
        await NotificationService.report2developers(
            'キューの実行が中止されました',
            `id:${abortedTaskDoc.get('_id')}
name:${abortedTaskDoc.get('name')}
data:${(data !== undefined) ? data : ''}
runs_at:${moment(abortedTaskDoc.get('runs_at')).toISOString()}
last_tried_at:${moment(abortedTaskDoc.get('last_tried_at')).toISOString()}
最終結果:${results[results.length - 1]}`
        )();
    };
}
