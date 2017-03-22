import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization): () => Promise<void>;
