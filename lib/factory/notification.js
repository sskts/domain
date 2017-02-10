"use strict";
const email_1 = require("../model/notification/email");
const objectId_1 = require("../model/objectId");
/**
 * 通知ファクトリー
 *
 * @namespace
 */
var NotificationFactory;
(function (NotificationFactory) {
    function createEmail(args) {
        return new email_1.default((args._id === undefined) ? objectId_1.default() : (args._id), (args.from === undefined) ? "" : (args.from), (args.to === undefined) ? "" : (args.to), (args.subject === undefined) ? "" : (args.subject), (args.content === undefined) ? "" : (args.content));
    }
    NotificationFactory.createEmail = createEmail;
})(NotificationFactory || (NotificationFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationFactory;
