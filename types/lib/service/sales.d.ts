/**
 * 売上サービス
 *
 * @namespace SalesService
 */
import * as GMO from '@motionpicture/gmo-service';
import Authorization from '../model/authorization';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: Authorization.GMOAuthorization): (gmoRepository: typeof GMO) => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: Authorization.GMOAuthorization): (gmoRepository: typeof GMO) => Promise<void>;
