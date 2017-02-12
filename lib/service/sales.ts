import GMOAuthorization from "../model/authorization/gmo";
import * as GMO from "@motionpicture/gmo-service";

export type GMOOperation<T> = (gmoRepository: typeof GMO) => Promise<T>;

/**
 * 売上サービス
 *
 * @interface SalesService
 */
interface SalesService {
    /**
     * GMOオーソリ取消
     *
     * @param {GMOAuthorization} authorization GMOオーソリ
     */
    cancelGMOAuth(authorization: GMOAuthorization): GMOOperation<void>;
    /**
     * GMO売上確定
     *
     * @param {GMOAuthorization} authorization GMOオーソリ
     */
    settleGMOAuth(authorization: GMOAuthorization): GMOOperation<void>;
}

export default SalesService;