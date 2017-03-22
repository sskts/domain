/**
 * 売上サービス
 *
 * @namespace SalesService
 */
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';

const debug = createDebug('sskts-domain:service:sales');

/**
 * GMOオーソリ取消
 */
export function cancelGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization) {
    return async () => {
        debug('calling alterTran...');
        await GMO.CreditService.alterTran({
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
export function settleGMOAuth(authorization: GMOAuthorizationFactory.IGMOAuthorization) {
    return async () => {
        debug('calling alterTran...');
        await GMO.CreditService.alterTran({
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
