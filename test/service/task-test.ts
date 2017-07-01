/**
 * タスクサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import TaskAdapter from '../../lib/adapter/task';

import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import * as SendEmailNotificationTaskFactory from '../../lib/factory/task/sendEmailNotification';
import TaskName from '../../lib/factory/taskName';
import TaskStatus from '../../lib/factory/taskStatus';

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
        await TaskService.executeByName(name)(taskAdapter);

        // 実行済みのキューはないはず
        const taskDoc = await taskAdapter.taskModel.findOne({
            status: TaskStatus.Executed,
            name: name
        }).exec();
        assert.equal(taskDoc, null);
    });

    it('タスクがあれば完了', async () => {
        const taskAdapter = new TaskAdapter(connection);

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
            status: TaskStatus.Ready,
            runs_at: new Date(),
            max_number_of_try: 1,
            last_tried_at: null,
            number_of_tried: 0,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.executeByName(TaskName.SendEmailNotification)(taskAdapter);

        const taskDoc = <mongoose.Document>await taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), TaskStatus.Executed);

        // テストデータ削除
        await taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    });
});

describe('タスクサービス:中止', () => {
    it('最大試行回数に達すると中止する', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

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
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            max_number_of_try: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.abort(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        const taskDoc = <mongoose.Document>await taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), TaskStatus.Aborted);

        // テストデータ削除
        await taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    });
});

describe('タスクサービス:リトライ', () => {
    it('最大試行回数に達していなければリトライする', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

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
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            max_number_of_try: 2,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        const taskDoc = <mongoose.Document>await taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), TaskStatus.Ready);

        // テストデータ削除
        await taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    });

    it('最大試行回数に達するとリトライしない', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

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
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            max_number_of_try: 1,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        await TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        const taskDoc = <mongoose.Document>await taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), TaskStatus.Running);

        // テストデータ削除
        await taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    });

    it('最終試行日時から指定インターバル経過していなければリトライしない', async () => {
        const INTERVAL_IN_MINUTES = 10;
        const taskAdapter = new TaskAdapter(connection);

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
            status: TaskStatus.Running,
            runs_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            max_number_of_try: 2,
            last_tried_at: moment().add(-INTERVAL_IN_MINUTES + 1, 'minutes').toDate(),
            number_of_tried: 1,
            execution_results: []
        });
        await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();

        // 9分前に最終試行に対して、10分のインターバルでリトライ
        await TaskService.retry(INTERVAL_IN_MINUTES)(taskAdapter);

        // ステータスが変更されているかどうか確認
        const taskDoc = <mongoose.Document>await taskAdapter.taskModel.findById(task.id, 'status').exec();
        assert.equal(taskDoc.get('status'), TaskStatus.Running);

        // テストデータ削除
        await taskAdapter.taskModel.findByIdAndRemove(task.id).exec();
    });
});
