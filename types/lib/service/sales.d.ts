import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MVTKAuthorizationFactory from '../factory/authorization/mvtk';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization): () => Promise<void>;
/**
 * ムビチケ資産移動
 */
export declare function settleMvtkAuthorization(__: MVTKAuthorizationFactory.IMvtkAuthorization): () => Promise<void>;
