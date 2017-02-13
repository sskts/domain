"use strict";
/**
 * 通知
 *
 * @class Notification
 *
 * @param {ObjectId} _id
 * @param {string} group 通知グループ
 */
class Notification {
    constructor(_id, group) {
        this._id = _id;
        this.group = group;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Notification;
