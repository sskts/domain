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
export function cancelGMOAuth(authorization: GMOAuthorization) {
    return async (gmoRepository: typeof GMO) => {
        await gmoRepository.CreditService.alterTran({
            shopId: authorization.gmo_shop_id,
            shopPass: authorization.gmo_shop_pass,
            accessId: authorization.gmo_access_id,
            accessPass: authorization.gmo_access_pass,
            jobCd: GMO.Util.JOB_CD_VOID,
            amount: authorization.gmo_amount
        });

        // todo 失敗したら取引状態確認する?
    };
}

/**
 * GMO売上確定
 */
export function settleGMOAuth(authorization: GMOAuthorization) {
    return async (gmoRepository: typeof GMO) => {
        await gmoRepository.CreditService.alterTran({
            shopId: authorization.gmo_shop_id,
            shopPass: authorization.gmo_shop_pass,
            accessId: authorization.gmo_access_id,
            accessPass: authorization.gmo_access_pass,
            jobCd: GMO.Util.JOB_CD_SALES,
            amount: authorization.gmo_amount
        });

        // todo 失敗したら取引状態確認する?
    };
}
