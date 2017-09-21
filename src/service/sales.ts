/**
 * sales service
 * mainly handle transactions with GMO
 * @namespace service.sales
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as AuthorizeActionRepository } from '../repo/action/authorize';
import { MongoRepository as TransactionRepository } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:sales');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * クレジットカードオーソリ取消
 * @export
 * @function
 * @memberof service.sales
 * @param {string} transactionId 取引ID
 */
export function cancelCreditCardAuth(transactionId: string) {
    return async (authorizeActionRepo: AuthorizeActionRepository) => {
        // クレジットカード仮売上アクションを取得
        const authorizeActions: factory.action.authorize.creditCard.IAction[] =
            await authorizeActionRepo.findByTransactionId(transactionId)
                .then((actions) => {
                    return actions
                        .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
                        .filter((action) => action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard);
                });

        await Promise.all(authorizeActions.map(async (action) => {
            const entryTranArgs = (<factory.action.authorize.creditCard.IResult>action.result).entryTranArgs;
            const execTranArgs = (<factory.action.authorize.creditCard.IResult>action.result).execTranArgs;

            debug('calling alterTran...');
            await GMO.services.credit.alterTran({
                shopId: entryTranArgs.shopId,
                shopPass: entryTranArgs.shopPass,
                accessId: execTranArgs.accessId,
                accessPass: execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Void,
                amount: entryTranArgs.amount
            });
        }));

        // 失敗したら取引状態確認してどうこう、という処理も考えうるが、
        // GMOはapiのコール制限が厳しく、下手にコールするとすぐにクライアントサイドにも影響をあたえてしまう
        // リトライはタスクの仕組みに含まれているので失敗してもここでは何もしない
    };
}

/**
 * クレジットカード売上確定
 * @export
 * @function
 * @memberof service.sales
 * @param {string} transactionId 取引ID
 */
export function settleCreditCardAuth(transactionId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        const authorizeActions = transaction.object.authorizeActions
            .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((action) => action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard);

        await Promise.all(authorizeActions.map(async (authorizeAction) => {
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
        }));
    };
}

/**
 * ムビチケ着券取消し
 * @export
 * @function
 * @memberof service.sales
 * @param {string} transactionId 取引ID
 */
export function cancelMvtk(transactionId: string) {
    return async () => {
        debug('canceling mvtk...transactionId:', transactionId);
        // ムビチケは実は仮押さえの仕組みがないので何もしない
    };
}

/**
 * ムビチケ資産移動
 * @export
 * @function
 * @memberof service.sales
 * @param {string} transactionId 取引ID
 */
export function settleMvtk(transactionId: string) {
    return async () => {
        debug('settling mvtk...transactionId:', transactionId);
        // 実は取引成立の前に着券済みなので何もしない
    };
}
