"use strict";
/**
 * task service
 * タスクサービス
 * @namespace service/task
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const NotificationService = require("./notification");
const TaskFunctionsService = require("./taskFunctions");
const debug = createDebug('sskts-domain:service:task');
exports.ABORT_REPORT_SUBJECT = 'One task aboted !!!';
/**
 * execute a task by taskName
 * タスク名でタスクをひとつ実行する
 * @param {factory.taskName} taskName タスク名
 * @export
 * @function
 * @memberof service/task
 */
function executeByName(taskName) {
    return (taskRepository, connection) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のタスクを取得
        let task = null;
        try {
            task = yield taskRepository.executeOneByName(taskName);
            debug('task found', task);
        }
        catch (error) {
            debug('executeByName error:', error);
        }
        // タスクがなければ終了
        if (task !== null) {
            yield execute(task)(taskRepository, connection);
        }
    });
}
exports.executeByName = executeByName;
/**
 * execute a task
 * タスクを実行する
 * @param {factory.task.ITask} task タスクオブジェクト
 * @export
 * @function
 * @memberof service/task
 */
function execute(task) {
    debug('executing a task...', task);
    const now = new Date();
    return (taskRepository, connection) => __awaiter(this, void 0, void 0, function* () {
        try {
            // タスク名の関数が定義されていなければ、TypeErrorとなる
            yield TaskFunctionsService[task.name](task.data)(connection);
            const result = {
                executedAt: now,
                error: ''
            };
            yield taskRepository.pushExecutionResultById(task.id, factory.taskStatus.Executed, result);
        }
        catch (error) {
            // 実行結果追加
            const result = {
                executedAt: now,
                error: error.stack
            };
            // 失敗してもここではステータスを戻さない(Runningのまま待機)
            yield taskRepository.pushExecutionResultById(task.id, task.status, result);
        }
    });
}
exports.execute = execute;
/**
 * retry tasks in running status
 * 実行中ステータスのままになっているタスクをリトライする
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクをリトライするか
 * @returns {TaskOperation<void>}
 * @export
 * @function
 * @memberof service/task
 */
function retry(intervalInMinutes) {
    return (taskRepository) => __awaiter(this, void 0, void 0, function* () {
        yield taskRepository.retry(intervalInMinutes);
    });
}
exports.retry = retry;
/**
 * abort a task
 * トライ可能回数が0に達したタスクを実行中止する
 * @param {number} intervalInMinutes 最終トライ日時から何分経過したタスクを中止するか
 * @returns {TaskOperation<void>}
 * @export
 * @function
 * @memberof service/task
 */
function abort(intervalInMinutes) {
    return (taskRepository) => __awaiter(this, void 0, void 0, function* () {
        const abortedTask = yield taskRepository.abortOne(intervalInMinutes);
        debug('abortedTask found', abortedTask);
        // 開発者へ報告
        yield NotificationService.report2developers(exports.ABORT_REPORT_SUBJECT, `id:${abortedTask.id}
name:${abortedTask.name}
runsAt:${moment(abortedTask.runsAt).toISOString()}
lastTriedAt:${moment(abortedTask.lastTriedAt).toISOString()}
numberOfTried:${abortedTask.numberOfTried}
lastResult:${(abortedTask.executionResults.length > 0) ? abortedTask.executionResults[abortedTask.executionResults.length - 1].error : ''}`)();
    });
}
exports.abort = abort;
