/// <reference types="mongoose" />
import ObjectId from "./objectId";
/**
 * 所有権
 * 誰が、何を、所有するのか
 *
 * @class Ownership
 *
 * @param {ObjectId} _id
 * @param {ObjectId} owner 所有者
 * @param {boolean} authenticated 認証済みかどうか
 */
export default class Ownership {
    readonly _id: ObjectId;
    readonly owner: ObjectId;
    readonly authenticated: boolean;
    constructor(_id: ObjectId, owner: ObjectId, authenticated: boolean);
}
