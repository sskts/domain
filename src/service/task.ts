/**
 * task service
 * タスクサービス
 * @namespace service/task
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { MongoRepository as TaskRepository } from '../repo/task';

import * as NotificationService from './notification';
import * as TaskFunctionsService from './taskFunctions';

export type TaskOperation<T> = (taskRepository: TaskRepository) => Promise<T>;
export type TaskAndConnectionOperation<T> = (taskRepository: TaskRepository, connection: mongoose.Connection) => Promise<T>;

const debug = createDebug('sskts-domain:service:task');

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
        let task: factory.task.ITask | null = null;
        try {
            task = await taskRepository.executeOneByName(taskName);
            debug('task found', task);
        } catch (error) {
            console.error(error);
        }

        // タスクがなければ終了
        if (task !== null) {
            await execute(task)(taskRepository, connection);
        }
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
                id: mongoose.Types.ObjectId().toString(),
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
                id: mongoose.Types.ObjectId().toString(),
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
        const lastTriedAt = moment().add(-intervalInMinutes, 'minutes').toDate();
        await taskRepository.retry(lastTriedAt);
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

        // 開発者へ報告
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
