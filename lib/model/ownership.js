"use strict";
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
class Ownership {
    constructor(_id, owner, authenticated) {
        this._id = _id;
        this.owner = owner;
        this.authenticated = authenticated;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Ownership;
