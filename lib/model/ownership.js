"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:variable-name
const objectId_1 = require("./objectId");
/**
 * 所有権
 * 誰が、何を、所有するのか
 *
 * @class Ownership
 *
 * @param {string} id
 * @param {string} owner 所有者
 * @param {boolean} authenticated 認証済みかどうか
 */
class Ownership {
    constructor(id, owner, authenticated) {
        this.id = id;
        this.owner = owner;
        this.authenticated = authenticated;
        // todo validation
    }
}
(function (Ownership) {
    function create(args) {
        return new Ownership((args.id) ? args.id : objectId_1.default().toString(), args.owner, args.authenticated);
    }
    Ownership.create = create;
})(Ownership || (Ownership = {}));
exports.default = Ownership;
