/**
 * sales service
 * mainly handle transactions with GMO
 * @namespace service/sales
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as TransactionRepository } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:sales');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * クレジットカードオーソリ取消
 * @memberof service/sales
 */
export function cancelCreditCardAuth(transactionId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        const authorizeAction = <factory.action.authorize.creditCard.IAction | undefined>transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard
        );
        if (authorizeAction !== undefined) {
            const entryTranArgs = (<factory.action.authorize.creditCard.IResult>authorizeAction.result).entryTranArgs;
            const execTranArgs = (<factory.action.authorize.creditCard.IResult>authorizeAction.result).execTranArgs;

            debug('calling alterTran...');
            await GMO.services.credit.alterTran({
                shopId: entryTranArgs.shopId,
                shopPass: entryTranArgs.shopPass,
                accessId: execTranArgs.accessId,
                accessPass: execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Void,
                amount: entryTranArgs.amount
            });
        }

        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
    };
}

/**
 * クレジットカード売上確定
 * @memberof service/sales
 */
export function settleCreditCardAuth(transactionId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        const authorizeAction = <factory.action.authorize.creditCard.IAction | undefined>transaction.object.paymentInfos.find(
            (paymentInfo) => paymentInfo.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard
        );
        if (authorizeAction !== undefined) {
            const entryTranArgs = (<factory.action.authorize.creditCard.IResult>authorizeAction.result).entryTranArgs;
            const execTranArgs = (<factory.action.authorize.creditCard.IResult>authorizeAction.result).execTranArgs;

            // 取引状態参照
            const searchTradeResult = await GMO.services.credit.searchTrade({
                shopId: entryTranArgs.shopId,
                shopPass: entryTranArgs.shopPass,
                orderId: entryTranArgs.orderId
            });

            if (searchTradeResult.jobCd === GMO.utils.util.JobCd.Sales) {
                debug('already in SALES');
                // すでに実売上済み

                return;
            }

            debug('calling alterTran...');
            await GMO.services.credit.alterTran({
                shopId: entryTranArgs.shopId,
                shopPass: entryTranArgs.shopPass,
                accessId: execTranArgs.accessId,
                accessPass: execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Sales,
                amount: entryTranArgs.amount
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
    return async (__2: TransactionRepository) => {
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    };
}

/**
 * ムビチケ資産移動
 *
 * @memberof service/sales
 */
export function settleMvtk(__1: string) {
    return async (__2: TransactionRepository) => {
        // 実は取引成立の前に着券済みなので何もしない
    };
}
