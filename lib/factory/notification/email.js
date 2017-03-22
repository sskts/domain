"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Eメール通知ファクトリー
 *
 * @namespace EmailNotificationFactory
 */
const validator = require("validator");
const notificationGroup_1 = require("../notificationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    // todo validation
    if (validator.isEmpty(args.from))
        throw new RangeError('from required.');
    if (validator.isEmpty(args.to))
        throw new RangeError('to required.');
    if (validator.isEmpty(args.subject))
        throw new RangeError('subject required.');
    if (validator.isEmpty(args.content))
        throw new RangeError('content required.');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : (args.id),
        group: notificationGroup_1.default.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
}
exports.create = create;
