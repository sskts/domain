"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 所有権ファクトリー
 * 誰が、何を、所有するのか
 *
 * @namespace AssetFactory
 */
const _ = require("underscore");
const argumentNull_1 = require("../error/argumentNull");
const objectId_1 = require("./objectId");
function create(args) {
    if (_.isEmpty(args.owner))
        throw new argumentNull_1.default('owner');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        owner: args.owner,
        authenticated: args.authenticated
    };
}
exports.create = create;
