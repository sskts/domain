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
     * ログイン会員所有者ID
     *
     * @type {string}
     * @memberof IClientUser
     */
    owner?: string;
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
export declare function create(args: {
    client: string;
    state: string;
    owner?: string;
    scopes: string[];
}): IClientUser;
