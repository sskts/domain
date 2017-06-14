import OwnerGroup from './ownerGroup';
/**
 * 取引スコープインターフェース
 * todo 仮実装なので、調整あるいは拡張していくこと
 *
 * @interface ITransactionScope
 * @memberof factory/transactionScope
 */
export interface ITransactionScope {
    /**
     * いつから開始準備状態か
     *
     * @type {Date}
     * @memberof ITransactionScope
     */
    ready_from: Date;
    /**
     * いつまで開始準備状態か
     *
     * @type {Date}
     * @memberof ITransactionScope
     */
    ready_until: Date;
    /**
     * どのクライアントでやりとりされる取引なのか
     *
     * @type {string}
     * @memberof ITransactionScope
     */
    client?: string;
    /**
     * どの劇場における取引なのか
     *
     * @type {string}
     * @memberof ITransactionScope
     */
    theater?: string;
    /**
     * どのグループの所有者の取引なのか
     *
     * @type {OwnerGroup}
     * @memberof ITransactionScope
     */
    owner_group?: OwnerGroup;
}
/**
 * 取引スコープを作成する
 *
 * @returns {ITransactionScope}
 * @memberof factory/transactionScope
 */
export declare function create(args: {
    ready_from: Date;
    ready_until: Date;
    client?: string;
    theater?: string;
    owner_group?: OwnerGroup;
}): ITransactionScope;
/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope 取引スコープ
 */
export declare function scope2String(scope: ITransactionScope): string;
