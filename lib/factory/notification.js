"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 通知ファクトリー
 *
 * @namespace NotificationFacroty
 */
const validator = require("validator");
const notificationGroup_1 = require("./notificationGroup");
const objectId_1 = require("./objectId");
function createEmail(args) {
    // todo validation
    if (validator.isEmpty(args.from))
        throw new Error('from required.');
    if (validator.isEmpty(args.to))
        throw new Error('to required.');
    if (validator.isEmpty(args.subject))
        throw new Error('subject required.');
    if (validator.isEmpty(args.content))
        throw new Error('content required.');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : (args.id),
        group: notificationGroup_1.default.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
}
exports.createEmail = createEmail;
