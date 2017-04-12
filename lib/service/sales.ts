/**
 * 売上サービス
 *
 * @namespace SalesService
 */
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MVTKAuthorizationFactory from '../factory/authorization/mvtk';

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
        // 取引状態参照
        const searchTradeResult = await GMO.CreditService.searchTrade({
            shopId: authorization.gmo_shop_id,
            shopPass: authorization.gmo_shop_pass,
            orderId: authorization.gmo_order_id
        });

        if (searchTradeResult.jobCd === GMO.Util.JOB_CD_SALES) {
            debug('already in SALES');
            // すでに実売上済み
            return;
        }

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

/**
 * ムビチケ資産移動
 */
export function settleMvtkAuthorization(__: MVTKAuthorizationFactory.IMvtkAuthorization) {
    return async () => {
        // 実は取引成立の前に着券済みなので何もしない
    };
}
