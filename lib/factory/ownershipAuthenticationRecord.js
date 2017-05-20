"use strict";
/**
 * 所有権認証記録ファクトリー
 * いつ、どこで、何のために、どうやって所有権が認証されたのか
 *
 * @namespace factory/ownershipAuthenticationRecord
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
/**
 * 所有権認証記録を生成する
 *
 * @memberof factory/ownershipAuthenticationRecord
 */
function create(args) {
    if (!_.isDate(args.when))
        throw new argument_1.default('when', 'when should be Date');
    if (_.isEmpty(args.where))
        throw new argumentNull_1.default('where');
    if (_.isEmpty(args.why))
        throw new argumentNull_1.default('why');
    if (_.isEmpty(args.how))
        throw new argumentNull_1.default('how');
    return args;
}
exports.create = create;
