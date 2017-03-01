"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:variable-name
const validator = require("validator");
const notificationGroup_1 = require("./notificationGroup");
const objectId_1 = require("./objectId");
/**
 * 通知
 *
 * @class Notification
 *
 * @param {string} id
 * @param {string} group 通知グループ
 */
class Notification {
    constructor(id, group) {
        this.id = id;
        this.group = group;
        // todo validation
    }
}
(function (Notification) {
    /**
     * Eメール通知
     *
     * @class EmailNotification
     * @extends {Notification}
     * @param {string} id
     * @param {string} from
     * @param {string} to
     * @param {string} subject
     * @param {string} content
     */
    // tslint:disable-next-line:max-classes-per-file
    class EmailNotification extends Notification {
        constructor(id, 
            // tslint:disable-next-line:no-reserved-keywords
            from, to, subject, content) {
            super(id, notificationGroup_1.default.EMAIL);
            this.id = id;
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
    Notification.EmailNotification = EmailNotification;
    function createEmail(args) {
        return new EmailNotification((args.id === undefined) ? objectId_1.default().toString() : (args.id), args.from, args.to, args.subject, args.content);
    }
    Notification.createEmail = createEmail;
})(Notification || (Notification = {}));
exports.default = Notification;
