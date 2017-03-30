"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 一般所有者ファクトリー
 *
 * @namespace AnonymousOwnerFactory
 */
const _ = require("underscore");
const validator = require("validator");
const argument_1 = require("../../error/argument");
const objectId_1 = require("../objectId");
const ownerGroup_1 = require("../ownerGroup");
/**
 * 一般所有者を作成する
 */
function create(args) {
    if (!_.isEmpty(args.email) && !validator.isEmail(args.email))
        throw new argument_1.default('email', 'invalid email');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: ownerGroup_1.default.ANONYMOUS,
        name_first: (args.name_first === undefined) ? '' : args.name_first,
        name_last: (args.name_last === undefined) ? '' : args.name_last,
        email: (args.email === undefined) ? '' : args.email,
        tel: (args.tel === undefined) ? '' : args.tel
    };
}
exports.create = create;
