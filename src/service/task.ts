/**
 * タスクサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
 * @namespace service/task
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import TaskAdapter from '../adapter/task';

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
    numberOfTried: 1, // トライ回数の少なさ優先
    runsAt: 1 // 実行予定日時の早さ優先
};

export function executeByName(taskName: factory.taskName): TaskAndConnectionOperation<void> {
    return async (taskAdapter: TaskAdapter, connection: mongoose.Connection) => {
        // 未実行のタスクを取得
        const taskDoc = await taskAdapter.taskModel.findOneAndUpdate(
            {
                status: factory.taskStatus.Ready,
                runsAt: { $lt: new Date() },
                name: taskName
            },
            {
                status: factory.taskStatus.Running, // 実行中に変更
                lastTriedAt: new Date(),
                $inc: {
                    remainingNumberOfTries: -1, // 残りトライ可能回数減らす
                    numberOfTried: 1 // トライ回数増やす
                }
            },
            { new: true }
        ).sort(sortOrder4executionOfTasks).exec();
        debug('taskDoc found', taskDoc);

        // タスクがなければ終了
        if (taskDoc === null) {
            return;
        }

        const task = <factory.task.ITask>taskDoc.toObject();
        await execute(task)(taskAdapter, connection);
    };
}

export function execute(task: factory.task.ITask): TaskAndConnectionOperation<void> {
    return async (taskAdapter: TaskAdapter, connection: mongoose.Connection) => {
        try {
            // タスク名の関数が定義されていなければ、TypeErrorとなる
            await (<any>TaskFunctionsService)[task.name](task.data)(connection);

            const result = factory.taskExecutionResult.create({
                executedAt: new Date(),
                error: ''
            });
            await taskAdapter.taskModel.findByIdAndUpdate(
                task.id,
                {
                    status: factory.taskStatus.Executed,
                    $push: { executionResults: result }
                }
            ).exec();
        } catch (error) {
            // 失敗してもここでは戻さない(Runningのまま待機)
            // 実行結果追加
            const result = factory.taskExecutionResult.create({
                executedAt: new Date(),
                error: error.stack
            });
            await taskAdapter.taskModel.findByIdAndUpdate(
                task.id,
                { $push: { executionResults: result } }
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
                status: factory.taskStatus.Running,
                lastTriedAt: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
                remainingNumberOfTries: { $gt: 0 }
            },
            {
                status: factory.taskStatus.Ready // 実行前に変更
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
                status: factory.taskStatus.Running,
                lastTriedAt: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
                remainingNumberOfTries: 0
            },
            {
                status: factory.taskStatus.Aborted
            },
            { new: true }
        ).exec();
        debug('abortedTaskDoc found', abortedTaskDoc);

        if (abortedTaskDoc === null) {
            return;
        }

        // メール通知
        const task = <factory.task.ITask>abortedTaskDoc.toObject();
        await NotificationService.report2developers(
            'タスクの実行が中止されました',
            `id:${task.id}
name:${task.name}
runsAt:${moment(task.runsAt).toISOString()}
lastTriedAt:${moment(<Date>task.lastTriedAt).toISOString()}
numberOfTried:${task.numberOfTried}
最終結果:${(task.executionResults.length > 0) ? task.executionResults[task.executionResults.length - 1].error : ''}`
        )();
    };
}
