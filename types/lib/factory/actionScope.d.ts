export interface IActionScope {
    /**
     * いつから開始準備状態か
     *
     * @type {Date}
     * @memberof IActionScope
     */
    ready_from: Date;
    /**
     * いつまで開始準備状態か
     *
     * @type {Date}
     * @memberof IActionScope
     */
    ready_until: Date;
    /**
     * どのクライアントでやりとりされるアクションなのか
     *
     * @type {string}
     * @memberof IActionScope
     */
    client?: string;
    /**
     * どの劇場におけるアクションなのか
     *
     * @type {string}
     * @memberof IActionScope
     */
    theater?: string;
}
export declare function create(args: {
    ready_from: Date;
    ready_until: Date;
    client?: string;
    theater?: string;
}): IActionScope;
/**
 * スコープを文字列に変換する
 *
 * @param {IActionScope} scope アクションスコープ
 */
export declare function scope2String(scope: IActionScope): string;
