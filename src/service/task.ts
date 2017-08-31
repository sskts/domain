/**
 * task service
 * タスクサービス
 * @namespace service/task
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import TaskRepository from '../repository/task';

import * as NotificationService from './notification';
import * as TaskFunctionsService from './taskFunctions';

export type TaskOperation<T> = (taskRepository: TaskRepository) => Promise<T>;
export type TaskAndConnectionOperation<T> = (taskRepository: TaskRepository, connection: mongoose.Connection) => Promise<T>;

const debug = createDebug('sskts-domain:service:task');

/**
 * タスク実行時のソート条件
 * @const
 */
const sortOrder4executionOfTasks = {
    numberOfTried: 1, // トライ回数の少なさ優先
    runsAt: 1 // 実行予定日時の早さ優先
};

/**
 * execute a task by taskName
 * タスク名でタスクをひとつ実行する
 * @param {factory.taskName} taskName タスク名
 * @export
 * @function
 * @memberof service/task
 */
export function executeByName(taskName: factory.taskName): TaskAndConnectionOperation<void> {
    return async (taskRepository: TaskRepository, connection: mongoose.Connection) => {
        // 未実行のタスクを取得
        const taskDoc = await taskRepository.taskModel.findOneAndUpdate(
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
        await execute(task)(taskRepository, connection);
    };
}

/**
 * execute a task
 * タスクを実行する
 * @param {factory.task.ITask} task タスクオブジェクト
 * @export
 * @function
 * @memberof service/task
 */
export function execute(task: factory.task.ITask): TaskAndConnectionOperation<void> {
    debug('executing a task...', task);

    return async (taskRepository: TaskRepository, connection: mongoose.Connection) => {
        try {
            // タスク名の関数が定義されていなければ、TypeErrorとなる
            await (<any>TaskFunctionsService)[task.name](task.data)(connection);

            const result = factory.taskExecutionResult.create({
                executedAt: new Date(),
                error: ''
            });
            await taskRepository.taskModel.findByIdAndUpdate(
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
            await taskRepository.taskModel.findByIdAndUpdate(
                task.id,
                { $push: { executionResults: result } }
            ).exec();
        }
    };
}

/**
 * retry tasks in running status
 * 実行中ステータスのままになっているタスクをリトライする
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクをリトライするか
 * @returns {TaskOperation<void>}
 * @export
 * @function
 * @memberof service/task
 */
export function retry(intervalInMinutes: number): TaskOperation<void> {
    return async (taskRepository: TaskRepository) => {
        await taskRepository.taskModel.update(
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
 * abort a task
 * トライ可能回数が0に達したタスクを実行中止する
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクを中止するか
 * @returns {TaskOperation<void>}
 * @export
 * @function
 * @memberof service/task
 */
export function abort(intervalInMinutes: number): TaskOperation<void> {
    return async (taskRepository: TaskRepository) => {
        const abortedTaskDoc = await taskRepository.taskModel.findOneAndUpdate(
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
            'One task aboted !!!',
            `id:${task.id}
name:${task.name}
runsAt:${moment(task.runsAt).toISOString()}
lastTriedAt:${moment(<Date>task.lastTriedAt).toISOString()}
numberOfTried:${task.numberOfTried}
lastResult:${(task.executionResults.length > 0) ? task.executionResults[task.executionResults.length - 1].error : ''}`
        )();
    };
}
