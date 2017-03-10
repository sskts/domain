import * as Authorization from '../factory/authorization';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: Authorization.IGMOAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: Authorization.IGMOAuthorization): () => Promise<void>;
