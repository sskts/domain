/**
 * タスクファンクションサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import * as SendEmailNotificationTaskFactory from '../../lib/factory/task/sendEmailNotification';
import TaskStatus from '../../lib/factory/taskStatus';

import * as TaskFunctionsService from '../../lib/service/taskFunctions';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('タスクファンクションサービス:メール送信', () => {
    it('通知成功', async () => {
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

        await TaskFunctionsService.sendEmailNotification(task.data)(connection);
    });
});
