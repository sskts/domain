"use strict";
const owner_1 = require("../owner");
const ownerGroup_1 = require("../ownerGroup");
/**
 * 匿名所有者
 *
 *
 * @class AnonymousOwner
 * @extends {Owner}
 */
class AnonymousOwner extends owner_1.default {
    /**
     * Creates an instance of AnonymousOwner.
     *
     * @param {ObjectId} _id
     * @param {string} name_first
     * @param {string} name_last
     * @param {string} email
     * @param {string} tel
     *
     * @memberOf AnonymousOwner
     */
    constructor(_id, name_first, name_last, email, tel) {
        super(_id, ownerGroup_1.default.ANONYMOUS);
        this._id = _id;
        this.name_first = name_first;
        this.name_last = name_last;
        this.email = email;
        this.tel = tel;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnonymousOwner;
