"use strict";
/**
 * タスクファンクションサービステスト
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
const mongoose = require("mongoose");
const EmailNotificationFactory = require("../../lib/factory/notification/email");
const SendEmailNotificationTaskFactory = require("../../lib/factory/task/sendEmailNotification");
const taskStatus_1 = require("../../lib/factory/taskStatus");
const TaskFunctionsService = require("../../lib/service/taskFunctions");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
describe('タスクファンクションサービス:メール送信', () => {
    it('通知成功', () => __awaiter(this, void 0, void 0, function* () {
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
        yield TaskFunctionsService.sendEmailNotification(task.data)(connection);
    }));
});
