/// <reference types="mongoose" />
import ObjectId from "./objectId";
/**
 * 通知
 *
 * @export
 * @class Notification
 */
export default class Notification {
    readonly _id: ObjectId;
    readonly group: string;
    /**
     * Creates an instance of Notification.
     *
     * @param {ObjectId} _id
     * @param {string} group 通知グループ
     */
    constructor(_id: ObjectId, group: string);
}
