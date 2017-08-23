"use strict";
/**
 * Eメール通知ファクトリー
 *
 * @namespace factory/notification/email
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const notificationGroup_1 = require("../notificationGroup");
const objectId_1 = require("../objectId");
/**
 *
 * @memberof tobereplaced$
 */
function create(args) {
    if (_.isEmpty(args.from))
        throw new argumentNull_1.default('from');
    if (_.isEmpty(args.to))
        throw new argumentNull_1.default('to');
    if (_.isEmpty(args.subject))
        throw new argumentNull_1.default('subject');
    if (_.isEmpty(args.content))
        throw new argumentNull_1.default('content');
    if (!validator.isEmail(args.from))
        throw new argument_1.default('from', 'from should be email');
    if (!validator.isEmail(args.to))
        throw new argument_1.default('to', 'to should be email');
    if (args.send_at !== undefined) {
        if (!_.isDate(args.send_at))
            throw new argument_1.default('send_at', 'send_at should be Date');
    }
    // todo sendgridの仕様上72時間後までしか設定できないのでバリデーション追加するかもしれない
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: notificationGroup_1.default.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content,
        send_at: (args.send_at === undefined) ? new Date() : args.send_at
    };
}
exports.create = create;
