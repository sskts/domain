/**
 * sales service
 * mainly handle transactions with GMO
 * @namespace service.sales
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as CreditCardAuthorizeActionRepo } from '../repo/action/authorize/creditCard';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

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
    return async (creditCardAuthorizeActionRepo: CreditCardAuthorizeActionRepo) => {
        // クレジットカード仮売上アクションを取得
        const authorizeActions: factory.action.authorize.creditCard.IAction[] =
            await creditCardAuthorizeActionRepo.findByTransactionId(transactionId)
                .then((actions) => actions.filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus));

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
    return async (transactionRep: TransactionRepo) => {
        const transaction = await transactionRep.findPlaceOrderById(transactionId);
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

export function returnCreditCardSales(transactionId: string) {
    return async (
        actionRepo: ActionRepo,
        transactionRep: TransactionRepo
    ) => {
        const transaction = await transactionRep.findReturnOrderById(transactionId);
        const returnOrderTransactionresult = transaction.result;
        const placeOrderTransaction = transaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;
        const authorizeActions = placeOrderTransaction.object.authorizeActions
            .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((action) => action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard);

        if (returnOrderTransactionresult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }

        if (placeOrderTransactionResult === undefined) {
            throw new factory.errors.NotFound('placeOrderTransaction.result');
        }

        await Promise.all(authorizeActions.map(async (authorizeAction) => {

            // アクション開始
            const returnPayActionAttributes = returnOrderTransactionresult.returnPayActionAttributes;
            const action = await actionRepo.start<factory.action.transfer.returnAction.pay.IAction>(
                returnPayActionAttributes.typeOf,
                returnPayActionAttributes.agent,
                returnPayActionAttributes.recipient,
                returnPayActionAttributes.object
            );

            let alterTranResult: GMO.services.credit.IAlterTranResult;
            try {
                // 取引状態参照
                const gmoTrade = await GMO.services.credit.searchTrade({
                    shopId: authorizeAction.result.entryTranArgs.shopId,
                    shopPass: authorizeAction.result.entryTranArgs.shopPass,
                    orderId: authorizeAction.result.entryTranArgs.orderId
                });
                debug('gmoTrade is', gmoTrade);

                // 実売上状態であれば取消
                // 手数料がかかるのであれば、ChangeTran、かからないのであれば、AlterTran
                if (gmoTrade.status === GMO.utils.util.Status.Sales) {
                    debug('canceling credit card sales...', authorizeAction);
                    alterTranResult = await GMO.services.credit.alterTran({
                        shopId: authorizeAction.result.entryTranArgs.shopId,
                        shopPass: authorizeAction.result.entryTranArgs.shopPass,
                        accessId: gmoTrade.accessId,
                        accessPass: gmoTrade.accessPass,
                        jobCd: GMO.utils.util.JobCd.Void
                    });
                    debug('GMO alterTranResult is', alterTranResult);
                } else {
                    alterTranResult = {
                        accessId: gmoTrade.accessId,
                        accessPass: gmoTrade.accessPass,
                        forward: gmoTrade.forward,
                        approve: gmoTrade.approve,
                        tranId: gmoTrade.tranId,
                        tranDate: ''
                    };
                }
            } catch (error) {
                // actionにエラー結果を追加
                try {
                    const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                    await actionRepo.giveUp(factory.actionType.ReturnAction, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                throw new Error(error);
            }

            // アクション完了
            debug('ending action...');
            await actionRepo.complete(factory.actionType.ReturnAction, action.id, { alterTranResult });
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
