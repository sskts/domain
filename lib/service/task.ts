/**
 * タスクサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/task
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import TaskAdapter from '../adapter/task';

import * as TaskFactory from '../factory/task';
import * as TaskExecutionResult from '../factory/taskExecutionResult';
import TaskName from '../factory/taskName';
import TaskStatus from '../factory/taskStatus';

import * as NotificationService from './notification';
import * as TaskFunctionsService from './taskFunctions';

export type TaskOperation<T> = (taskAdapter: TaskAdapter) => Promise<T>;
export type TaskAndConnectionOperation<T> = (taskAdapter: TaskAdapter, connection: mongoose.Connection) => Promise<T>;

const debug = createDebug('sskts-domain:service:task');

/**
 * タスク実行時のソート条件
 *
 * @ignore
 */
const sortOrder4executionOfTasks = {
    number_of_tried: 1, // トライ回数の少なさ優先
    runs_at: 1 // 実行予定日時の早さ優先
};

export function executeByName(taskName: TaskName): TaskAndConnectionOperation<void> {
    return async (taskAdapter: TaskAdapter, connection: mongoose.Connection) => {
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
                $inc: {
                    remaining_number_of_tries: -1, // 残りトライ可能回数減らす
                    number_of_tried: 1 // トライ回数増やす
                }
            },
            { new: true }
        ).sort(sortOrder4executionOfTasks).exec();
        debug('taskDoc found', taskDoc);

        // タスクがなければ終了
        if (taskDoc === null) {
            return;
        }

        const task = <TaskFactory.ITask>taskDoc.toObject();
        await execute(task)(taskAdapter, connection);
    };
}

export function execute(task: TaskFactory.ITask): TaskAndConnectionOperation<void> {
    return async (taskAdapter: TaskAdapter, connection: mongoose.Connection) => {
        try {
            // タスク名の関数が定義されていなければ、TypeErrorとなる
            await (<any>TaskFunctionsService)[task.name](task.data)(connection);

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
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクをリトライするか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export function retry(intervalInMinutes: number): TaskOperation<void> {
    return async (taskAdapter: TaskAdapter) => {
        await taskAdapter.taskModel.update(
            {
                status: TaskStatus.Running,
                last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
                remaining_number_of_tries: { $gt: 0 }
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
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクを中止するか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
export function abort(intervalInMinutes: number): TaskOperation<void> {
    return async (taskAdapter: TaskAdapter) => {
        const abortedTaskDoc = await taskAdapter.taskModel.findOneAndUpdate(
            {
                status: TaskStatus.Running,
                last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
                remaining_number_of_tries: 0
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
        const task = <TaskFactory.ITask>abortedTaskDoc.toObject();
        await NotificationService.report2developers(
            'タスクの実行が中止されました',
            `id:${task.id}
name:${task.name}
runs_at:${moment(task.runs_at).toISOString()}
last_tried_at:${moment(<Date>task.last_tried_at).toISOString()}
number_of_tried:${task.number_of_tried}
最終結果:${(task.execution_results.length > 0) ? task.execution_results[task.execution_results.length - 1].error : ''}`
        )();
    };
}
