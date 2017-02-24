import AccessTokenScope from '../model/accessTokenScope';
/**
 * アクセストークンを発行する
 *
 * @see https://tools.ietf.org/html/rfc7523
 */
export declare function sign(assertion: string, scope: AccessTokenScope): Promise<string>;
/**
 * アクセストークンを検証する
 *
 * @see https://tools.ietf.org/html/rfc7523
 */
export declare function verify(token: string): Promise<{}>;
