"use strict";
/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const objectId_1 = require("../objectId");
const ownerGroup_1 = require("../ownerGroup");
function create(args) {
    if (_.isEmpty(args.username))
        throw new argumentNull_1.default('username');
    if (_.isEmpty(args.password_hash))
        throw new argumentNull_1.default('password_hash');
    if (_.isEmpty(args.name_first))
        throw new argumentNull_1.default('name_first');
    if (_.isEmpty(args.name_last))
        throw new argumentNull_1.default('name_last');
    if (_.isEmpty(args.email))
        throw new argumentNull_1.default('email');
    if (!validator.isEmail(args.email)) {
        throw new argument_1.default('email', 'invalid email');
    }
    if (!_.isArray(args.payment_agency_members)) {
        throw new argument_1.default('payment_agency_members', 'payment_agency_members should be array');
    }
    if (args.payment_agency_members.length === 0) {
        throw new argument_1.default('payment_agency_members', 'payment_agency_members should not be empty');
    }
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: ownerGroup_1.default.MEMBER,
        username: args.username,
        password_hash: args.password_hash,
        name_first: args.name_first,
        name_last: args.name_last,
        email: args.email,
        tel: (args.tel === undefined) ? '' : args.tel,
        description: (args.description === undefined) ? { en: '', ja: '' } : args.description,
        notes: (args.notes === undefined) ? { en: '', ja: '' } : args.notes,
        payment_agency_members: args.payment_agency_members
    };
}
exports.create = create;
