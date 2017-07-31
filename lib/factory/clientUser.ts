/**
 * アプリケーションクライアントユーザーファクトリー
 * クライアントサイドでapiを利用するユーザー
 *
 * @namespace factory/clientUser
 */

/**
 * クライアントユーザーインターフェース
 *
 * @export
 * @interface IClientUser
 * @memberof factory/clientUser
 */
export interface IClientUser {
    /**
     * アプリケーションクライアントID
     *
     * @type {string}
     * @memberof IClientUser
     */
    client: string;
    /**
     * アプリケーション状態
     *
     * @type {string}
     * @memberof IClientUser
     */
    state: string;
    /**
     * ログイン会員人物ID
     *
     * @type {string}
     * @memberof IClientUser
     */
    person?: string;
    /**
     * スコープ
     *
     * @type {string[]}
     * @memberof IClientUser
     */
    scopes: string[];
}

/**
 * クライアントユーザーを作成する
 *
 * @export
 * @returns {IClientUser} クライアントユーザー
 */
export function create(args: {
    client: string;
    state: string;
    person?: string;
    scopes: string[];
}): IClientUser {
    // todo validation

    return args;
}
