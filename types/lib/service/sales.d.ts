import * as GMOAuthorization from '../factory/authorization/gmo';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: GMOAuthorization.IGMOAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: GMOAuthorization.IGMOAuthorization): () => Promise<void>;
