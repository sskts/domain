"use strict";
/**
 * 一般所有者ファクトリー
 *
 * @namespace factory/owner/anonymous
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const validator = require("validator");
const argument_1 = require("../../error/argument");
const objectId_1 = require("../objectId");
const ownerGroup_1 = require("../ownerGroup");
/**
 * 一般所有者を作成する
 * @memberof factory/owner/anonymous
 */
function create(args) {
    if (!_.isEmpty(args.email) && !validator.isEmail(args.email))
        throw new argument_1.default('email', 'invalid email');
    const id = (args.id === undefined) ? objectId_1.default().toString() : args.id;
    return {
        id: id,
        group: ownerGroup_1.default.ANONYMOUS,
        username: `sskts-domain:owners:anonymous:${id}`,
        name_first: (args.name_first === undefined) ? '' : args.name_first,
        name_last: (args.name_last === undefined) ? '' : args.name_last,
        email: (args.email === undefined) ? '' : args.email,
        tel: (args.tel === undefined) ? '' : args.tel,
        state: (args.state === undefined) ? '' : args.state,
        description: { en: '', ja: '' },
        notes: { en: '', ja: '' }
    };
}
exports.create = create;
