"use strict";
/**
 * 所有権ファクトリー
 * 誰が、何を、所有するのか
 *
 * @namespace factory/ownership
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argumentNull_1 = require("../error/argumentNull");
const objectId_1 = require("./objectId");
/**
 * 所有権を生成する
 *
 * @memberof factory/ownership
 */
function create(args) {
    if (_.isEmpty(args.owner))
        throw new argumentNull_1.default('owner');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        owner: args.owner,
        authentication_records: (args.authentication_records === undefined) ? [] : args.authentication_records
    };
}
exports.create = create;
