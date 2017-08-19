"use strict";
/**
 * 人物ファクトリー
 *
 * @namespace factory/person
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const validator = require("validator");
const argument_1 = require("../error/argument");
/**
 * 人物を作成する
 *
 * @memberof factory/person
 */
function create(args) {
    if (!_.isEmpty(args.email) && !validator.isEmail(args.email)) {
        throw new argument_1.default('email', 'invalid email');
    }
    return {
        id: (args.id === undefined) ? '' : args.id,
        typeOf: 'Person',
        givenName: (args.givenName === undefined) ? '' : args.givenName,
        familyName: (args.familyName === undefined) ? '' : args.familyName,
        email: (args.email === undefined) ? '' : args.email,
        telephone: (args.telephone === undefined) ? '' : args.telephone,
        username: args.username,
        memberOf: args.memberOf
    };
}
exports.create = create;
