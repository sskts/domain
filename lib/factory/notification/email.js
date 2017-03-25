"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Eメール通知ファクトリー
 *
 * @namespace EmailNotificationFactory
 */
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const notificationGroup_1 = require("../notificationGroup");
const objectId_1 = require("../objectId");
function create(args) {
    // todo validation
    if (validator.isEmpty(args.from))
        throw new argumentNull_1.default('from');
    if (validator.isEmpty(args.to))
        throw new argumentNull_1.default('to');
    if (validator.isEmpty(args.subject))
        throw new argumentNull_1.default('subject');
    if (validator.isEmpty(args.content))
        throw new argumentNull_1.default('content');
    if (!validator.isEmail(args.from))
        throw new argument_1.default('from', 'from should be email');
    if (!validator.isEmail(args.to))
        throw new argument_1.default('to', 'to should be email');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: notificationGroup_1.default.EMAIL,
        from: args.from,
        to: args.to,
        subject: args.subject,
        content: args.content
    };
}
exports.create = create;
