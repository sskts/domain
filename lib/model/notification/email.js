"use strict";
// tslint:disable:variable-name
const validator = require("validator");
const notification_1 = require("../notification");
const notificationGroup_1 = require("../notificationGroup");
/**
 * Eメール通知
 *
 *
 * @class EmailNotification
 * @extends {Notification}
 */
class EmailNotification extends notification_1.default {
    /**
     * Creates an instance of EmailNotification.
     *
     * @param {ObjectId} _id
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} content
     *
     * @memberOf EmailNotification
     */
    constructor(_id, 
        // tslint:disable-next-line:no-reserved-keywords
        from, to, subject, content) {
        super(_id, notificationGroup_1.default.EMAIL);
        this._id = _id;
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.content = content;
        // todo validation
        if (validator.isEmpty(from))
            throw new Error('from required.');
        if (validator.isEmpty(to))
            throw new Error('to required.');
        if (validator.isEmpty(subject))
            throw new Error('subject required.');
        if (validator.isEmpty(content))
            throw new Error('content required.');
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailNotification;
