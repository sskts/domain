"use strict";
/**
 * 会員所有者ファクトリー
 *
 * @namespace factory/owner/member
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const _ = require("underscore");
const validator = require("validator");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const objectId_1 = require("../objectId");
const ownerGroup_1 = require("../ownerGroup");
function create(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_.isEmpty(args.username))
            throw new argumentNull_1.default('username');
        if (_.isEmpty(args.password))
            throw new argumentNull_1.default('password');
        // 可変フィールドのバリデーション
        const variableFields = {
            name_first: args.name_first,
            name_last: args.name_last,
            email: args.email,
            tel: (args.tel === undefined) ? '' : args.tel,
            state: (args.state === undefined) ? '' : args.state,
            description: (args.description === undefined) ? { en: '', ja: '' } : args.description,
            notes: (args.notes === undefined) ? { en: '', ja: '' } : args.notes
        };
        validateVariableFields(variableFields);
        // パスワードハッシュ化
        // todo ハッシュ化文字列をインターフェースとして用意し、ハッシュプロセスをどこかへ移動する
        const SALT_LENGTH = 8;
        const passwordHash = yield bcrypt.hash(args.password, SALT_LENGTH);
        return {
            id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
            group: ownerGroup_1.default.MEMBER,
            username: args.username,
            password_hash: passwordHash,
            name_first: args.name_first,
            name_last: args.name_last,
            email: args.email,
            tel: variableFields.tel,
            state: variableFields.state,
            description: variableFields.description,
            notes: variableFields.notes
        };
    });
}
exports.create = create;
function validateVariableFields(variableFields) {
    if (_.isEmpty(variableFields.name_first))
        throw new argumentNull_1.default('name_first');
    if (_.isEmpty(variableFields.name_last))
        throw new argumentNull_1.default('name_last');
    if (_.isEmpty(variableFields.email))
        throw new argumentNull_1.default('email');
    if (!validator.isEmail(variableFields.email)) {
        throw new argument_1.default('email', 'invalid email');
    }
    if (_.isUndefined(variableFields.description)) {
        throw new argument_1.default('description', 'description should be defined');
    }
    if (_.isUndefined(variableFields.tel)) {
        throw new argument_1.default('tel', 'tel should be defined');
    }
    if (_.isUndefined(variableFields.notes)) {
        throw new argument_1.default('notes', 'notes should be defined');
    }
}
exports.validateVariableFields = validateVariableFields;
