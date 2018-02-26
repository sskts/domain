/**
 * タスクサービス
 * @namespace service.task
 */

import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import { MongoRepository as TaskRepository } from '../repo/task';

import * as NotificationService from './notification';
import * as TaskFunctionsService from './taskFunctions';

export type TaskOperation<T> = (taskRepository: TaskRepository) => Promise<T>;
export type TaskAndConnectionOperation<T> = (
    taskRepository: TaskRepository,
    connection: mongoose.Connection,
    pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials
) => Promise<T>;

const debug = createDebug('sskts-domain:service:task');

export const ABORT_REPORT_SUBJECT = 'Task aborted !!!';

/**
 * execute a task by taskName
 * タスク名でタスクをひとつ実行する
 * @param taskName タスク名
 * @export
 */
export function executeByName(taskName: factory.taskName): TaskAndConnectionOperation<void> {
    return async (
        taskRepository: TaskRepository,
        connection: mongoose.Connection,
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials
    ) => {
        // 未実行のタスクを取得
        let task: factory.task.ITask | null = null;
        try {
            task = await taskRepository.executeOneByName(taskName);
            debug('task found', task);
        } catch (error) {
            debug('executeByName error:', error);
        }

        // タスクがなければ終了
        if (task !== null) {
            await execute(task)(taskRepository, connection, pecorinoAuthClient);
        }
    };
}

/**
 * execute a task
 * タスクを実行する
 * @param task タスクオブジェクト
 * @export
 */
export function execute(task: factory.task.ITask): TaskAndConnectionOperation<void> {
    debug('executing a task...', task);
    const now = new Date();

    return async (
        taskRepository: TaskRepository,
        connection: mongoose.Connection,
        pecorinoAuthClient?: pecorinoapi.auth.ClientCredentials
    ) => {
        try {
            // タスク名の関数が定義されていなければ、TypeErrorとなる
            await (<any>TaskFunctionsService)[task.name](task.data)(connection, pecorinoAuthClient);

            const result = {
                executedAt: now,
                error: ''
            };
            await taskRepository.pushExecutionResultById(task.id, factory.taskStatus.Executed, result);
        } catch (error) {
            // 実行結果追加
            const result = {
                executedAt: now,
                error: error.stack
            };
            // 失敗してもここではステータスを戻さない(Runningのまま待機)
            await taskRepository.pushExecutionResultById(task.id, task.status, result);
        }
    };
}

/**
 * retry tasks in running status
 * 実行中ステータスのままになっているタスクをリトライする
 * @param intervalInMinutes 最終トライ日時から何分経過したタスクをリトライするか
 * @export
 */
export function retry(intervalInMinutes: number): TaskOperation<void> {
    return async (taskRepository: TaskRepository) => {
        await taskRepository.retry(intervalInMinutes);
    };
}

/**
 * abort a task
 * トライ可能回数が0に達したタスクを実行中止する
 * @param intervalInMinutes 最終トライ日時から何分経過したタスクを中止するか
 * @export
 */
export function abort(intervalInMinutes: number): TaskOperation<void> {
    return async (taskRepository: TaskRepository) => {
        const abortedTask = await taskRepository.abortOne(intervalInMinutes);
        debug('abortedTask found', abortedTask);

        // 開発者へ報告
        const lastResult = (abortedTask.executionResults.length > 0) ?
            abortedTask.executionResults[abortedTask.executionResults.length - 1].error :
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore next */
            '';

        await NotificationService.report2developers(
            ABORT_REPORT_SUBJECT,
            `id:${abortedTask.id}
name:${abortedTask.name}
runsAt:${moment(abortedTask.runsAt).toISOString()}
lastTriedAt:${moment(<Date>abortedTask.lastTriedAt).toISOString()}
numberOfTried:${abortedTask.numberOfTried}
lastResult:${lastResult}`
        )();
    };
}
