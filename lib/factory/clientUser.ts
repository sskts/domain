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
    sub: string;
    token_use: string;
    scope: string;
    iss: string;
    exp: number;
    iat: number;
    version: number;
    jti: string;
    client_id: string;
    username?: string;
}
