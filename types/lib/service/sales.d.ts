/**
 * 売上サービス
 *
 * @namespace SalesService
 */
import * as GMO from '@motionpicture/gmo-service';
import GMOAuthorization from '../model/authorization/gmo';
/**
 * GMOオーソリ取消
 */
export declare function cancelGMOAuth(authorization: GMOAuthorization): (gmoRepository: typeof GMO) => Promise<void>;
/**
 * GMO売上確定
 */
export declare function settleGMOAuth(authorization: GMOAuthorization): (gmoRepository: typeof GMO) => Promise<void>;
