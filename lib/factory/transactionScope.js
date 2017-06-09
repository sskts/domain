"use strict";
/**
 * 取引スコープファクトリー
 *
 * @namespace factory/transactionScope
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引スコープを作成する
 *
 * @returns {ITransactionScope}
 * @memberof factory/transactionScope
 */
function create(args) {
    return {
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
