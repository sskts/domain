"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("./objectId");
const ownerGroup_1 = require("./ownerGroup");
/**
 * 一般所有者を作成する
 */
function createAnonymous(args) {
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: ownerGroup_1.default.ANONYMOUS,
        name_first: (args.name_first === undefined) ? '' : args.name_first,
        name_last: (args.name_last === undefined) ? '' : args.name_last,
        email: (args.email === undefined) ? '' : args.email,
        tel: (args.tel === undefined) ? '' : args.tel
    };
}
exports.createAnonymous = createAnonymous;
/**
 * 興行所有者オブジェクトを作成する
 *
 * @export
 * @param {string} [args.id]
 * @param {string} [args.name]
 * @returns {IPromoterOwner}
 */
function createPromoter(args) {
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: ownerGroup_1.default.PROMOTER,
        name: (args.name === undefined) ? { ja: '', en: '' } : args.name
    };
}
exports.createPromoter = createPromoter;
