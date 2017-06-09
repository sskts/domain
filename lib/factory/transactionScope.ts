/**
 * 取引スコープファクトリー
 *
 * @namespace factory/transactionScope
 */

import OwnerGroup from './ownerGroup';

/**
 * 取引スコープインターフェース
 * todo 仮実装なので、調整あるいは拡張していくこと
 *
 * @interface ITransactionScope
 * @memberof factory/transactionScope
 */
export interface ITransactionScope {
    client?: string;
    theater?: string;
    owner_group?: OwnerGroup;
}

/**
 * 取引スコープを作成する
 *
 * @returns {ITransactionScope}
 * @memberof factory/transactionScope
 */
export function create(args: {
    client?: string;
    theater?: string;
    owner_group?: OwnerGroup;
}): ITransactionScope {
    return {
        client: args.client,
        theater: args.theater,
        owner_group: args.owner_group
    };
}

/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope 取引スコープ
 */
export function scope2String(scope: ITransactionScope) {
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
