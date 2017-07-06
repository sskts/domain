/**
 * タスクサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import TaskAdapter from '../../lib/adapter/task';

import * as SendEmailNotificationTaskFactory from '../../lib/factory/task/sendEmailNotification';
import * as TaskExecutionResultFactory from '../../lib/factory/taskExecutionResult';
import TaskName from '../../lib/factory/taskName';
import TaskStatus from '../../lib/factory/taskStatus';
import * as resources from '../resources';

import * as TaskService from '../../lib/service/task';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const taskAdapter = new TaskAdapter(connection);
    await taskAdapter.taskModel.remove({}).exec();
});

describe('タスクサービス:タスク名で実行する', () => {
    it('タスクがなければ何もしない', async () => {
        const name = TaskName.SendEmailNotification;
        const taskAdapter = new TaskAdapter(connection);
        await TaskService.executeByName(name)(taskAdapter, connection);

        // 実行済みのタスクはないはず
        await taskAdapter.taskModel.count({
            status: TaskStatus.Executed,
            name: name
        }).exec()
            .then((count) => {
                assert.equal(count, 0);
            });
    });

    it('タスク名の関数が未定義であれば実行失敗', async () => {
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const name = <any>'unknownTaskName';
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Ready,
            runs_at: new Date(),
            remaining_number_of_tries: 1,
            last_tried_at: null,
            number_of_tried: 0,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, { ...task, ...{ name: name } }, { upsert: true }).exec();

        await TaskService.executeByName(name)(taskAdapter, connection);

        // タスクが実行済みになっていないことを確認
        await taskAdapter.taskModel.findById(task.id, 'status execution_results').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Running);
                assert.equal(doc.get('execution_results').length, 1);
                assert.equal(typeof doc.get('execution_results')[0].error, 'string');

                // テストデータ削除
                await doc.remove();
            });
    });

    it('タスクがあれば完了', async () => {
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Ready,
            runs_at: new Date(),
            remaining_number_of_tries: 1,
            last_tried_at: null,
            number_of_tried: 0,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.executeByName(TaskName.SendEmailNotification)(taskAdapter, connection);

        await taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Executed);

                // テストデータ削除
                await doc.remove();
            });
    });
});

describe('タスクサービス:中止', () => {
    it('残りトライ回数があれば中止しない', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.abort(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        await taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Running);

                // テストデータ削除
                await doc.remove();
            });
    });

    it('残りトライ回数がなくなると中止する', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 0,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: [TaskExecutionResultFactory.create({
                executed_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
                error: 'test'
            })]
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.abort(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        await taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Aborted);

                // テストデータ削除
                await doc.remove();
            });
    });
});

describe('タスクサービス:リトライ', () => {
    it('トライ可能回数が残っていればリトライする', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        await taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Ready);

                // テストデータ削除
                await doc.remove();
            });
    });

    it('残りトライ回数がなくなればリトライしない', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            remaining_number_of_tries: 0,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        await taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Running);

                // テストデータ削除
                await doc.remove();
            });
    });

    it('最終トライ日時から指定インターバル経過していなければリトライしない', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

        // test data
        const task = SendEmailNotificationTaskFactory.create({
            data: {
                notification: resources.notification.createEmail()
            },
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            remaining_number_of_tries: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        // 9分前に最終トライに対して、10分のインターバルでリトライ
        await TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        await taskAdapter.taskModel.findById(task.id, 'status').exec()
            .then(async (doc: mongoose.Document) => {
                assert.equal(doc.get('status'), TaskStatus.Running);

                // テストデータ削除
                await doc.remove();
            });
    });
});
