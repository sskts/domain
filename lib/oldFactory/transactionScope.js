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
/**
 * 取引スコープを作成する
 *
 * @returns {ITransactionScope}
 * @memberof factory/transactionScope
 */
function create(args) {
    if (!_.isDate(args.ready_from))
        throw new argument_1.default('ready_from', 'ready_from should be Date');
    if (!_.isDate(args.ready_until))
        throw new argument_1.default('ready_until', 'ready_until should be Date');
    // untilはfromより遅くなければならない
    if (args.ready_until.getTime() <= args.ready_from.getTime()) {
        throw new argument_1.default('ready_until', 'ready_until must be later than ready_from');
    }
    return {
        ready_from: args.ready_from,
        ready_until: args.ready_until,
        client: args.client,
        theater: args.theater,
        owner_group: args.owner_group
    };
}
exports.create = create;
/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope 取引スコープ
 */
function scope2String(scope) {
    let scopeStr = 'transactionScope';
    scopeStr += `:ready_from:${moment(scope.ready_from).unix()}`;
    scopeStr += `:ready_until:${moment(scope.ready_until).unix()}`;
    if (scope.client !== undefined) {
        scopeStr += `:client:${scope.client}`;
    }
    if (scope.theater !== undefined) {
        scopeStr += `:theater:${scope.theater}`;
    }
    if (scope.owner_group !== undefined) {
        scopeStr += `:owner_group:${scope.owner_group}`;
    }
    return scopeStr;
}
exports.scope2String = scope2String;
