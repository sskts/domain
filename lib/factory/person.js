"use strict";
/**
 * 人物ファクトリー
 *
 * @namespace factory/person
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
const argument_1 = require("../error/argument");
const objectId_1 = require("./objectId");
/**
 * 人物を作成する
 *
 * @memberof factory/person
 */
function create(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_.isEmpty(args.email) && !validator.isEmail(args.email)) {
            throw new argument_1.default('email', 'invalid email');
        }
        // パスワードハッシュ化
        // todo ハッシュ化文字列をインターフェースとして用意し、ハッシュプロセスをどこかへ移動する
        const SALT_LENGTH = 8;
        const hashedPassword = (args.password === undefined) ? undefined : yield bcrypt.hash(args.password, SALT_LENGTH);
        return {
            id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
            typeOf: 'Person',
            givenName: (args.givenName === undefined) ? '' : args.givenName,
            familyName: (args.familyName === undefined) ? '' : args.familyName,
            email: (args.email === undefined) ? '' : args.email,
            telephone: (args.telephone === undefined) ? '' : args.telephone,
            username: args.username,
            hashedPassword: hashedPassword,
            memberOf: args.memberOf,
            owns: args.owns
        };
    });
}
exports.create = create;
