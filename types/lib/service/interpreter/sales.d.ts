import SalesService from "../sales";
import * as GMO from "@motionpicture/gmo-service";
import GMOAuthorization from "../../model/authorization/gmo";
/**
 * 売上サービス
 *
 * @class SalesServiceInterpreter
 * @implements {SalesService}
 */
export default class SalesServiceInterpreter implements SalesService {
    /**
     * GMOオーソリ取消
     */
    cancelGMOAuth(authorization: GMOAuthorization): (gmoRepository: typeof GMO) => Promise<void>;
    /**
     * GMO売上確定
     */
    settleGMOAuth(authorization: GMOAuthorization): (gmoRepository: typeof GMO) => Promise<void>;
}
