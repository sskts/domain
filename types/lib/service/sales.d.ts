import Authorization from '../model/authorization';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: Authorization.GMOAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: Authorization.GMOAuthorization): () => Promise<void>;
