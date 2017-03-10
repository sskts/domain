/**
 * 所有権ファクトリー
 * 誰が、何を、所有するのか
 *
 * @namespace AssetFacroty
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("./objectId");
function create(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        owner: args.owner,
        authenticated: args.authenticated
    };
}
exports.create = create;
