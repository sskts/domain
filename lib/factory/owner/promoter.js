"use strict";
/**
 * 興行所有者ファクトリー
 *
 * @namespace factory/owner/promoter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("../objectId");
const ownerGroup_1 = require("../ownerGroup");
/**
 * 興行所有者オブジェクトを作成する
 *
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IOwner}
 * @memberof tobereplaced$
 */
function create(args) {
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: ownerGroup_1.default.PROMOTER,
        name: (args.name === undefined) ? { ja: '', en: '' } : args.name
    };
}
exports.create = create;
