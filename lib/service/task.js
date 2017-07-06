"use strict";
/**
 * タスクサービス
 * タスク名ごとに、実行するファンクションをひとつずつ定義しています
 *
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
const createDebug = require("debug");
const moment = require("moment");
const TaskExecutionResult = require("../factory/taskExecutionResult");
const taskStatus_1 = require("../factory/taskStatus");
const NotificationService = require("./notification");
const TaskFunctionsService = require("./taskFunctions");
const debug = createDebug('sskts-domain:service:task');
/**
 * タスク実行時のソート条件
 *
 * @ignore
 */
const sortOrder4executionOfTasks = {
    number_of_tried: 1,
    runs_at: 1 // 実行予定日時の早さ優先
};
function executeByName(taskName) {
    return (taskAdapter, connection) => __awaiter(this, void 0, void 0, function* () {
        // 未実行のタスクを取得
        const taskDoc = yield taskAdapter.taskModel.findOneAndUpdate({
            status: taskStatus_1.default.Ready,
            runs_at: { $lt: new Date() },
            name: taskName
        }, {
            status: taskStatus_1.default.Running,
            last_tried_at: new Date(),
            $inc: { number_of_tried: 1 } // トライ回数増やす
        }, { new: true }).sort(sortOrder4executionOfTasks).exec();
        debug('taskDoc found', taskDoc);
        // タスクがなければ終了
        if (taskDoc === null) {
            return;
        }
        const task = taskDoc.toObject();
        yield execute(task)(taskAdapter, connection);
    });
}
exports.executeByName = executeByName;
function execute(task) {
    return (taskAdapter, connection) => __awaiter(this, void 0, void 0, function* () {
        try {
            // タスク名の関数が定義されていることが必須
            if (typeof TaskFunctionsService[task.name] !== 'function') {
                throw new TypeError(`function undefined ${task.name}`);
            }
            yield TaskFunctionsService[task.name](task.data)(connection);
            const result = TaskExecutionResult.create({
                executed_at: new Date(),
                error: ''
            });
            yield taskAdapter.taskModel.findByIdAndUpdate(task.id, {
                status: taskStatus_1.default.Executed,
                $push: { execution_results: result }
            }).exec();
        }
        catch (error) {
            // 失敗してもここでは戻さない(Runningのまま待機)
            // 実行結果追加
            const result = TaskExecutionResult.create({
                executed_at: new Date(),
                error: error.stack
            });
            yield taskAdapter.taskModel.findByIdAndUpdate(task.id, { $push: { execution_results: result } }).exec();
        }
    });
}
exports.execute = execute;
/**
 * リトライ
 *
 * @param {number} intervalInMinutes 最終試行日時から何分経過したタスクをリトライするか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
function retry(intervalInMinutes) {
    return (taskAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield taskAdapter.taskModel.update({
            status: taskStatus_1.default.Running,
            last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
            // tslint:disable-next-line:no-invalid-this space-before-function-paren
            $where: function () { return (this.max_number_of_try > this.number_of_tried); }
        }, {
            status: taskStatus_1.default.Ready // 実行前に変更
        }, { multi: true }).exec();
    });
}
exports.retry = retry;
/**
 * 実行中止
 *
 * @param {number} intervalInMinutes 最終試行日時から何分経過したタスクを中止するか
 * @returns {TaskOperation<void>}
 * @memberof service/task
 */
function abort(intervalInMinutes) {
    return (taskAdapter) => __awaiter(this, void 0, void 0, function* () {
        const abortedTaskDoc = yield taskAdapter.taskModel.findOneAndUpdate({
            status: taskStatus_1.default.Running,
            last_tried_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() },
            // tslint:disable-next-line:no-invalid-this space-before-function-paren
            $where: function () { return (this.max_number_of_try === this.number_of_tried); }
        }, {
            status: taskStatus_1.default.Aborted
        }, { new: true }).exec();
        debug('abortedTaskDoc found', abortedTaskDoc);
        if (abortedTaskDoc === null) {
            return;
        }
        // メール通知
        const results = abortedTaskDoc.get('execution_results');
        const data = abortedTaskDoc.get('data');
        yield NotificationService.report2developers('タスクの実行が中止されました', `id:${abortedTaskDoc.get('_id')}
name:${abortedTaskDoc.get('name')}
data:${(data !== undefined) ? data : ''}
runs_at:${moment(abortedTaskDoc.get('runs_at')).toISOString()}
last_tried_at:${moment(abortedTaskDoc.get('last_tried_at')).toISOString()}
最終結果:${results[results.length - 1]}`)();
    });
}
exports.abort = abort;
