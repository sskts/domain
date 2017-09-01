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
/**
 * タスク実行時のソート条件
 * @const
 */
const sortOrder4executionOfTasks = {
    numberOfTried: 1,
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
function executeByName(taskName) {
    return (taskRepository, connection) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のタスクを取得
        const taskDoc = yield taskRepository.taskModel.findOneAndUpdate({
            status: factory.taskStatus.Ready,
            runsAt: { $lt: new Date() },
            name: taskName
        }, {
            status: factory.taskStatus.Running,
            lastTriedAt: new Date(),
            $inc: {
                remainingNumberOfTries: -1,
                numberOfTried: 1 // トライ回数増やす
            }
        }, { new: true }).sort(sortOrder4executionOfTasks).exec();
        debug('taskDoc found', taskDoc);
        // タスクがなければ終了
        if (taskDoc === null) {
            return;
        }
        const task = taskDoc.toObject();
        yield execute(task)(taskRepository, connection);
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
    return (taskRepository, connection) => __awaiter(this, void 0, void 0, function* () {
        try {
            // タスク名の関数が定義されていなければ、TypeErrorとなる
            yield TaskFunctionsService[task.name](task.data)(connection);
            const result = factory.taskExecutionResult.create({
                executedAt: new Date(),
                error: ''
            });
            yield taskRepository.taskModel.findByIdAndUpdate(task.id, {
                status: factory.taskStatus.Executed,
                $push: { executionResults: result }
            }).exec();
        }
        catch (error) {
            // 失敗してもここでは戻さない(Runningのまま待機)
            // 実行結果追加
            const result = factory.taskExecutionResult.create({
                executedAt: new Date(),
                error: error.stack
            });
            yield taskRepository.taskModel.findByIdAndUpdate(task.id, { $push: { executionResults: result } }).exec();
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
        yield taskRepository.taskModel.update({
            status: factory.taskStatus.Running,
            lastTriedAt: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
            remainingNumberOfTries: { $gt: 0 }
        }, {
            status: factory.taskStatus.Ready // 実行前に変更
        }, { multi: true }).exec();
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
        const abortedTaskDoc = yield taskRepository.taskModel.findOneAndUpdate({
            status: factory.taskStatus.Running,
            lastTriedAt: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
            remainingNumberOfTries: 0
        }, {
            status: factory.taskStatus.Aborted
        }, { new: true }).exec();
        debug('abortedTaskDoc found', abortedTaskDoc);
        if (abortedTaskDoc === null) {
            return;
        }
        // 開発者へ報告
        const task = abortedTaskDoc.toObject();
        yield NotificationService.report2developers('One task aboted !!!', `id:${task.id}
name:${task.name}
runsAt:${moment(task.runsAt).toISOString()}
lastTriedAt:${moment(task.lastTriedAt).toISOString()}
numberOfTried:${task.numberOfTried}
lastResult:${(task.executionResults.length > 0) ? task.executionResults[task.executionResults.length - 1].error : ''}`)();
    });
}
exports.abort = abort;
