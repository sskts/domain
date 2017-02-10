"use strict";
/**
 * 通知
 *
 * @export
 * @class Notification
 */
class Notification {
    /**
     * Creates an instance of Notification.
     *
     * @param {ObjectId} _id
     * @param {string} group 通知グループ
     */
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Notification;
