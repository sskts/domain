export interface ITransactionScope {
    /**
     * いつから開始準備状態か
     *
     * @type {Date}
     * @memberof ITransactionScope
     */
    readyFrom: Date;
    /**
     * いつまで開始準備状態か
     *
     * @type {Date}
     * @memberof ITransactionScope
     */
    readyThrough: Date;
    /**
     * どのクライアントでやりとりされるアクションなのか
     *
     * @type {string}
     * @memberof ITransactionScope
     */
    client?: string;
    /**
     * どの劇場におけるアクションなのか
     *
     * @type {string}
     * @memberof ITransactionScope
     */
    theater?: string;
}
export declare function create(args: {
    readyFrom: Date;
    readyThrough: Date;
    client?: string;
    theater?: string;
}): ITransactionScope;
/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope アクションスコープ
 */
export declare function scope2String(scope: ITransactionScope): string;
