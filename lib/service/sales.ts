/**
 * 売上サービス
 *
 * @namespace service/sales
 */

import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';

const debug = createDebug('sskts-domain:service:sales');

/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export function cancelGMOAuth(authorization: GMOAuthorizationFactory.IAuthorization) {
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

        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはキューの仕組みに含まれているので失敗してもここでは何もしない
    };
}

/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
export function settleGMOAuth(authorization: GMOAuthorizationFactory.IAuthorization) {
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

        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはキューの仕組みに含まれているので失敗してもここでは何もしない
    };
}

/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
export function cancelMvtkAuthorization(__: MvtkAuthorizationFactory.IAuthorization) {
    return async () => {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    };
}

/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export function settleMvtkAuthorization(__: MvtkAuthorizationFactory.IAuthorization) {
    return async () => {
        // 実は取引成立の前に着券済みなので何もしない
    };
}
