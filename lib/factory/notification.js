/**
 * 通知ファクトリー
 *
 * @namespace NotificationFactory
 */
"use strict";
const email_1 = require("../model/notification/email");
const objectId_1 = require("../model/objectId");
function createEmail(args) {
    return new email_1.default((args._id === undefined) ? objectId_1.default() : (args._id), args.from, args.to, args.subject, args.content);
}
exports.createEmail = createEmail;
