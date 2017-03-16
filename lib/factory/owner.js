"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("./objectId");
const ownerGroup_1 = require("./ownerGroup");
/**
 * 一般所有者を作成する
 */
function createAnonymous(args) {
    return {
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: ownerGroup_1.default.ANONYMOUS,
        name_first: (args.name_first) ? args.name_first : '',
        name_last: (args.name_last) ? args.name_last : '',
        email: (args.email) ? args.email : '',
        tel: (args.tel) ? args.tel : ''
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
        id: (args.id) ? args.id : objectId_1.default().toString(),
        group: ownerGroup_1.default.PROMOTER,
        name: (args.name) ? args.name : { ja: '', en: '' }
    };
}
exports.createPromoter = createPromoter;
