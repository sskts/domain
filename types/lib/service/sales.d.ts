import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export declare function cancelGMOAuth(authorization: GMOAuthorizationFactory.IAuthorization): () => Promise<void>;
/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
export declare function settleGMOAuth(authorization: GMOAuthorizationFactory.IAuthorization): () => Promise<void>;
/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
export declare function cancelMvtkAuthorization(__: MvtkAuthorizationFactory.IAuthorization): () => Promise<void>;
/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export declare function settleMvtkAuthorization(__: MvtkAuthorizationFactory.IAuthorization): () => Promise<void>;
