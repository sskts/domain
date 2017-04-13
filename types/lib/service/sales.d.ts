import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization): () => Promise<void>;
/**
 * ムビチケ着券取消し
 */
export declare function cancelMvtkAuthorization(__: MvtkAuthorizationFactory.IMvtkAuthorization): () => Promise<void>;
/**
 * ムビチケ資産移動
 */
export declare function settleMvtkAuthorization(__: MvtkAuthorizationFactory.IMvtkAuthorization): () => Promise<void>;
