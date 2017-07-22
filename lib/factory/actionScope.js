"use strict";
/**
 * アクションスコープファクトリー
 *
 * @namespace factory/actionScope
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const _ = require("underscore");
const argument_1 = require("../error/argument");
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
        theater: args.theater
    };
}
exports.create = create;
/**
 * スコープを文字列に変換する
 *
 * @param {IActionScope} scope アクションスコープ
 */
function scope2String(scope) {
    let scopeStr = 'actionScope';
    scopeStr += `:ready_from:${moment(scope.ready_from).unix()}`;
    scopeStr += `:ready_until:${moment(scope.ready_until).unix()}`;
    if (scope.client !== undefined) {
        scopeStr += `:client:${scope.client}`;
    }
    if (scope.theater !== undefined) {
        scopeStr += `:theater:${scope.theater}`;
    }
    return scopeStr;
}
exports.scope2String = scope2String;
