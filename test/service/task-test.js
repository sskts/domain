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
const EmailNotificationFactory = require("../../lib/factory/notification/email");
const SendEmailNotificationTaskFactory = require("../../lib/factory/task/sendEmailNotification");
const taskName_1 = require("../../lib/factory/taskName");
const taskStatus_1 = require("../../lib/factory/taskStatus");
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
        yield TaskService.executeByName(name)(taskAdapter);
        // 実行済みのキューはないはず
        const taskDoc = yield taskAdapter.taskModel.findOne({
            status: taskStatus_1.default.Executed,
            name: name
        }).exec();
        assert.equal(taskDoc, null);
    }));
    it('タスクがあれば完了', () => __awaiter(this, void 0, void 0, function* () {
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: EmailNotificationFactory.create({
                    from: 'noreply@example.net',
                    to: process.env.SSKTS_DEVELOPER_EMAIL,
                    subject: 'sskts-domain:test:service:task-test',
                    content: 'sskts-domain:test:service:task-test'
                })
            },
            status: taskStatus_1.default.Ready,
            runs_at: new Date(),
            max_number_of_try: 1,
            last_tried_at: null,
            number_of_tried: 0,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.executeByName(taskName_1.default.SendEmailNotification)(taskAdapter);
        const taskDoc = yield taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), taskStatus_1.default.Executed);
        // テストデータ削除
        yield taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    }));
});
describe('タスクサービス:中止', () => {
    it('最大試行回数に達すると中止する', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: EmailNotificationFactory.create({
                    from: 'noreply@example.net',
                    to: process.env.SSKTS_DEVELOPER_EMAIL,
                    subject: 'sskts-domain:test:service:task-test',
                    content: 'sskts-domain:test:service:task-test'
                })
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            max_number_of_try: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.abort(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        const taskDoc = yield taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), taskStatus_1.default.Aborted);
        // テストデータ削除
        yield taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    }));
});
describe('タスクサービス:リトライ', () => {
    it('最大試行回数に達していなければリトライする', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: EmailNotificationFactory.create({
                    from: 'noreply@example.net',
                    to: process.env.SSKTS_DEVELOPER_EMAIL,
                    subject: 'sskts-domain:test:service:task-test',
                    content: 'sskts-domain:test:service:task-test'
                })
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            max_number_of_try: 2,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        const taskDoc = yield taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), taskStatus_1.default.Ready);
        // テストデータ削除
        yield taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    }));
    it('最大試行回数に達するとリトライしない', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: EmailNotificationFactory.create({
                    from: 'noreply@example.net',
                    to: process.env.SSKTS_DEVELOPER_EMAIL,
                    subject: 'sskts-domain:test:service:task-test',
                    content: 'sskts-domain:test:service:task-test'
                })
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            max_number_of_try: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        yield TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        const taskDoc = yield taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), taskStatus_1.default.Running);
        // テストデータ削除
        yield taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    }));
    it('最終試行日時から指定インターバル経過していなければリトライしない', () => __awaiter(this, void 0, void 0, function* () {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new task_1.default(connection);
        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: EmailNotificationFactory.create({
                    from: 'noreply@example.net',
                    to: process.env.SSKTS_DEVELOPER_EMAIL,
                    subject: 'sskts-domain:test:service:task-test',
                    content: 'sskts-domain:test:service:task-test'
                })
            },
            status: taskStatus_1.default.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            max_number_of_try: 2,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        // 9分前に最終試行に対して、10分のインターバルでリトライ
        yield TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);
        // ステータスが変更されているかどうか確認
        const taskDoc = yield taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), taskStatus_1.default.Running);
        // テストデータ削除
        yield taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    }));
});
