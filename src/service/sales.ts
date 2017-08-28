/**
 * sales service
 * mainly handle transactions with GMO
 * @namespace service/sales
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import ArgumentError from '../error/argument';

import TransactionAdapter from '../adapter/transaction';

const debug = createDebug('sskts-domain:service:sales');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * GMOオーソリ取消
 *
 * @memberof service/sales
 */
export function cancelGMOAuth(transactionId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
        }

        const authorization = <factory.authorization.gmo.IAuthorization | undefined>transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === factory.authorizationGroup.GMO
        );
        if (authorization !== undefined) {
            debug('calling alterTran...');
            await GMO.services.credit.alterTran({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                accessId: authorization.object.accessId,
                accessPass: authorization.object.accessPass,
                jobCd: GMO.utils.util.JobCd.Void,
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
export function settleGMOAuth(transactionId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        const transaction = await transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
        }

        const authorization = <factory.authorization.gmo.IAuthorization | undefined>transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.group === factory.authorizationGroup.GMO
        );
        if (authorization !== undefined) {
            // 取引状態参照
            const searchTradeResult = await GMO.services.credit.searchTrade({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                orderId: authorization.object.orderId
            });

            if (searchTradeResult.jobCd === GMO.utils.util.JobCd.Sales) {
                debug('already in SALES');
                // すでに実売上済み

                return;
            }

            debug('calling alterTran...');
            await GMO.services.credit.alterTran({
                shopId: authorization.object.shopId,
                shopPass: authorization.object.shopPass,
                accessId: authorization.object.accessId,
                accessPass: authorization.object.accessPass,
                jobCd: GMO.utils.util.JobCd.Sales,
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
export function cancelMvtk(__1: string) {
    return async (__2: TransactionAdapter) => {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    };
}

/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export function settleMvtk(__1: string) {
    return async (__2: TransactionAdapter) => {
        // 実は取引成立の前に着券済みなので何もしない
    };
}
