/**
 * 売上サービス
 *
 * @namespace service/sales
 */

import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import AuthorizationGroup from '../factory/authorizationGroup';
import * as PlaceOrderTransactionFactory from '../factory/transaction/placeOrder';

const debug = createDebug('sskts-domain:service:sales');

export type IPlaceOrderTransaction = PlaceOrderTransactionFactory.ITransaction;

/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export function cancelGMOAuth(transaction: IPlaceOrderTransaction) {
    return async () => {
        const authorization = <GMOAuthorizationFactory.IAuthorization | undefined>transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === AuthorizationGroup.GMO
        );
        if (authorization !== undefined) {
            debug('calling alterTran...');
            await GMO.CreditService.alterTran({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                accessId: authorization.object.accessId,
                accessPass: authorization.object.accessPass,
                jobCd: GMO.Util.JOB_CD_VOID,
                amount: authorization.object.amount
            });
        }

        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
    };
}

/**
 * GMO売上確定
 *
 * @memberof service/sales
 */
export function settleGMOAuth(transaction: IPlaceOrderTransaction) {
    return async () => {
        const authorization = <GMOAuthorizationFactory.IAuthorization | undefined>transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === AuthorizationGroup.GMO
        );
        if (authorization !== undefined) {
            // 取引状態参照
            const searchTradeResult = await GMO.CreditService.searchTrade({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                orderId: authorization.object.orderId
            });

            if (searchTradeResult.jobCd === GMO.Util.JOB_CD_SALES) {
                debug('already in SALES');
                // すでに実売上済み

                return;
            }

            debug('calling alterTran...');
            await GMO.CreditService.alterTran({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                accessId: authorization.object.accessId,
                accessPass: authorization.object.accessPass,
                jobCd: GMO.Util.JOB_CD_SALES,
                amount: authorization.object.amount
            });

            // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
            // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
            // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
        }
    };
}

/**
 * ムビチケ着券取消し
 *
 * @memberof service/sales
 */
export function cancelMvtk(__: IPlaceOrderTransaction) {
    return async () => {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    };
}

/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export function settleMvtk(__: IPlaceOrderTransaction) {
    return async () => {
        // 実は取引成立の前に着券済みなので何もしない
    };
}
