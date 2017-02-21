"use strict";
// tslint:disable:variable-name
const objectId_1 = require("./objectId");
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
        // todo validation
    }
}
(function (Ownership) {
    function create(args) {
        return new Ownership((args._id) ? args._id : objectId_1.default(), args.owner, args.authenticated);
    }
    Ownership.create = create;
})(Ownership || (Ownership = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Ownership;
