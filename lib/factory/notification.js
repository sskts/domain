/**
 * 通知ファクトリー
 *
 * @namespace NotificationFactory
 */
"use strict";
const email_1 = require("../model/notification/email");
const objectId_1 = require("../model/objectId");
function createEmail(args) {
    return new email_1.default((args._id === undefined) ? objectId_1.default() : (args._id), (args.from === undefined) ? "" : (args.from), (args.to === undefined) ? "" : (args.to), (args.subject === undefined) ? "" : (args.subject), (args.content === undefined) ? "" : (args.content));
}
exports.createEmail = createEmail;
