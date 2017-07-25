"use strict";
/**
 * 取引スコープファクトリー
 *
 * @namespace factory/transactionScope
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const _ = require("underscore");
const argument_1 = require("../error/argument");
function create(args) {
    if (!_.isDate(args.readyFrom))
        throw new argument_1.default('readyFrom', 'readyFrom should be Date');
    if (!_.isDate(args.readyThrough))
        throw new argument_1.default('readyThrough', 'readyThrough should be Date');
    // untilはfromより遅くなければならない
    if (args.readyThrough.getTime() <= args.readyFrom.getTime()) {
        throw new argument_1.default('readyThrough', 'readyThrough must be later than readyFrom');
    }
    return {
        readyFrom: args.readyFrom,
        readyThrough: args.readyThrough,
        client: args.client,
        theater: args.theater
    };
}
exports.create = create;
/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope アクションスコープ
 */
function scope2String(scope) {
    let scopeStr = 'transactionScope';
    scopeStr += `:readyFrom:${moment(scope.readyFrom).unix()}`;
    scopeStr += `:readyThrough:${moment(scope.readyThrough).unix()}`;
    if (scope.client !== undefined) {
        scopeStr += `:client:${scope.client}`;
    }
    if (scope.theater !== undefined) {
        scopeStr += `:theater:${scope.theater}`;
    }
    return scopeStr;
}
exports.scope2String = scope2String;
