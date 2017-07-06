"use strict";
/**
 * タスクサービステスト
 *
 * @ignore
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
const assert = require("assert");
const moment = require("moment");
const mongoose = require("mongoose");
const task_1 = require("../../lib/adapter/task");
const SendEmailNotificationTaskFactory = require("../../lib/factory/task/sendEmailNotification");
const TaskExecutionResultFactory = require("../../lib/factory/taskExecutionResult");
const taskName_1 = require("../../lib/factory/taskName");
const taskStatus_1 = require("../../lib/factory/taskStatus");
const resources = require("../resources");
const TaskService = require("../../lib/service/task");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const taskAdapter = new task_1.default(connection);
    yield taskAdapter.taskModel.remove({}).exec();
}));
describe('タスクサービス:タスク名で実行する', () => {
    it('タスクがなければ何もしない', () => __awaiter(this, void 0, void 0, function* () {
        const name = taskName_1.default.SendEmailNotification;
        const taskAdapter = new task_1.default(connection);
        yield TaskService.executeByName(name)(taskAdapter, connection);
        // 実行済みのタスクはないはず
        yield taskAdapter.taskModel.count({
            status: taskStatus_1.default.Executed,
            name: name
        }).exec()
            .then((count) => {
            assert.equal(count, 0);
        });
    }));
    it('タスク名の関数が未定義であれば実行失敗', () => __awaiter(this, void 0, void 0, function* () {
        const taskAdapter = new task_1.default(connection);
        // test data
        const name = 'unknownTaskName';
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Ready,
            runs_at: new Date(),
            remaining_number_of_tries: 1,
            last_tried_at: null,
            number_of_tried: 0,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, Object.assign({}, task, { name: name }), { upsert: true }).exec();
        yield TaskService.executeByName(name)(taskAdapter, connection);
        // タスクが実行済みになっていないことを確認
        yield taskAdapter.taskModel.findById(task.id, 'status execution_results').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Running);
            assert.equal(doc.get('execution_results').length, 1);
            assert.equal(typeof doc.get('execution_results')[0].error, 'string');
            // テストデータ削除
            yield doc.remove();
        }));
    }));
    it('タスクがあれば完了', () => __awaiter(this, void 0, void 0, function* () {
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Ready,
            runs_at: new Date(),
            remaining_number_of_tries: 1,
            last_tried_at: null,
            number_of_tried: 0,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.executeByName(taskName_1.default.SendEmailNotification)(taskAdapter, connection);
        yield taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Executed);
            // テストデータ削除
            yield doc.remove();
        }));
    }));
});
describe('タスクサービス:中止', () => {
    it('残りトライ回数があれば中止しない', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.abort(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        yield taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Running);
            // テストデータ削除
            yield doc.remove();
        }));
    }));
    it('残りトライ回数がなくなると中止する', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 0,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: [TaskExecutionResultFactory.create({
                    executed_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
                    error: 'test'
                })]
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.abort(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        yield taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Aborted);
            // テストデータ削除
            yield doc.remove();
        }));
    }));
});
describe('タスクサービス:リトライ', () => {
    it('トライ可能回数が残っていればリトライする', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        yield taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Ready);
            // テストデータ削除
            yield doc.remove();
        }));
    }));
    it('残りトライ回数がなくなればリトライしない', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 0,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        yield taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Running);
            // テストデータ削除
            yield doc.remove();
        }));
    }));
    it('最終トライ日時から指定インターバル経過していなければリトライしない', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            remaining_number_of_tries: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        // 9分前に最終トライに対して、10分のインターバルでリトライ
        yield TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        yield taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then((doc) => __awaiter(this, void 0, void 0, function* () {
            assert.equal(doc.get('status'), taskStatus_1.default.Running);
            // テストデータ削除
            yield doc.remove();
        }));
    }));
});
