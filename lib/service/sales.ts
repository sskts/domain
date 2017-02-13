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
        await gmoRepository.CreditService.alterTranInterface.call({
            shop_id: authorization.gmo_shop_id,
            shop_pass: authorization.gmo_shop_pass,
            access_id: authorization.gmo_access_id,
            access_pass: authorization.gmo_access_pass,
            job_cd: GMO.Util.JOB_CD_VOID,
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
        await gmoRepository.CreditService.alterTranInterface.call({
            shop_id: authorization.gmo_shop_id,
            shop_pass: authorization.gmo_shop_pass,
            access_id: authorization.gmo_access_id,
            access_pass: authorization.gmo_access_pass,
            job_cd: GMO.Util.JOB_CD_SALES,
            amount: authorization.gmo_amount
        });

        // todo 失敗したら取引状態確認する?
    };
}
