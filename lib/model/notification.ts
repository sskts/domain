import ObjectId from "./objectId";

/**
 * 通知
 *
 * @class Notification
 *
 * @param {ObjectId} _id
 * @param {string} group 通知グループ
 */
export default class Notification {
    constructor(
        readonly _id: ObjectId,
        readonly group: string,
    ) {
        // TODO validation
    }
}