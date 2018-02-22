/**
 * 決済サービス
 * @namespace service.payment
 */

import * as GMO from '@motionpicture/gmo-service';
import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:payment');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * Pecorino支払実行
 * @export
 * @param transactionId 取引ID
 */
export function payPecorino(transactionId: string) {
    return async (actionRepo: ActionRepo, transactionRepo: TransactionRepo, pecorinoAuthClient: pecorinoapi.auth.ClientCredentials) => {
        const transaction = await transactionRepo.findPlaceOrderById(transactionId);
        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }
        const potentialActions = transaction.potentialActions;
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        const payActionAttributes = potentialActions.order.potentialActions.payPecorino;
        if (payActionAttributes !== undefined) {
            // Pecorino承認アクションがあるはず
            const authorizeAction = <any>transaction.object.authorizeActions
                .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                .find((a) => a.object.typeOf === 'Pecorino');

            // アクション開始
            const action = await actionRepo.start<factory.action.trade.pay.IAction>(payActionAttributes);

            try {
                // 支払取引確定
                const payTransactionService = new pecorinoapi.service.transaction.Pay({
                    endpoint: authorizeAction.result.pecorinoEndpoint,
                    auth: pecorinoAuthClient
                });

                await payTransactionService.confirm({
                    transactionId: authorizeAction.result.pecorinoTransaction.id
                });

                // Pecorino決済の場合キャッシュバック
                const CACHBACK = 100;
                const customerContact = <factory.person.IContact>transaction.object.customerContact;
                const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                    endpoint: authorizeAction.result.pecorinoEndpoint,
                    auth: pecorinoAuthClient
                });
                const depositTransaction = await depositTransactionService.start({
                    toAccountId: authorizeAction.result.pecorinoTransaction.object.accountId,
                    expires: moment().add(1, 'minutes').toDate(),
                    agent: transaction.seller,
                    recipient: {
                        typeOf: transaction.agent.typeOf,
                        id: transaction.agent.id,
                        name: `${customerContact.givenName} ${customerContact.familyName}`,
                        url: transaction.agent.url
                    },
                    price: CACHBACK,
                    notes: 'sskts incentive'
                });

                await depositTransactionService.confirm({ transactionId: depositTransaction.id });
            } catch (error) {
                // actionにエラー結果を追加
                try {
                    // tslint:disable-next-line:max-line-length no-single-line-block-comment
                    const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : /* istanbul ignore next */ error;
                    await actionRepo.giveUp(payActionAttributes.typeOf, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                throw new Error(error);
            }

            // アクション完了
            debug('ending action...');
            const actionResult: factory.action.trade.pay.IResult = {};
            await actionRepo.complete(payActionAttributes.typeOf, action.id, actionResult);
        }
    };
}

/**
 * クレジットカードオーソリ取消
 * @export
 * @param transactionId 取引ID
 */
export function cancelCreditCardAuth(transactionId: string) {
    return async (actionRepo: ActionRepo) => {
        // クレジットカード仮売上アクションを取得
        const authorizeActions: factory.action.authorize.creditCard.IAction[] =
            await actionRepo.findAuthorizeByTransactionId(transactionId)
                .then((actions) => actions
                    .filter((a) => a.object.typeOf === factory.action.authorize.creditCard.ObjectType.CreditCard)
                    .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                );

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
 * @param transactionId 取引ID
 */
export function payCreditCard(transactionId: string) {
    return async (actionRepo: ActionRepo, transactionRep: TransactionRepo) => {
        const transaction = await transactionRep.findPlaceOrderById(transactionId);
        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }
        const potentialActions = transaction.potentialActions;
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        const payActionAttributes = potentialActions.order.potentialActions.payCreditCard;
        if (payActionAttributes !== undefined) {
            // クレジットカード承認アクションがあるはず
            const authorizeAction = <factory.action.authorize.creditCard.IAction>transaction.object.authorizeActions
                .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                .find((a) => a.object.typeOf === factory.action.authorize.creditCard.ObjectType.CreditCard);

            // アクション開始
            const action = await actionRepo.start<factory.action.trade.pay.IAction>(payActionAttributes);

            let alterTranResult: GMO.services.credit.IAlterTranResult;
            try {
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
                    alterTranResult = {
                        accessId: searchTradeResult.accessId,
                        accessPass: searchTradeResult.accessPass,
                        forward: searchTradeResult.forward,
                        approve: searchTradeResult.approve,
                        tranId: searchTradeResult.tranId,
                        tranDate: ''
                    };
                } else {
                    debug('calling alterTran...');
                    alterTranResult = await GMO.services.credit.alterTran({
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
            } catch (error) {
                // actionにエラー結果を追加
                try {
                    // tslint:disable-next-line:max-line-length no-single-line-block-comment
                    const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : /* istanbul ignore next */ error;
                    await actionRepo.giveUp(payActionAttributes.typeOf, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                throw new Error(error);
            }

            // アクション完了
            debug('ending action...');
            const actionResult: factory.action.trade.pay.IResult = { creditCardSales: alterTranResult };
            await actionRepo.complete(payActionAttributes.typeOf, action.id, actionResult);
        }
    };
}

/**
 * 注文返品取引からクレジットカード返金処理を実行する
 * @param transactionId 注文返品取引ID
 */
export function refundCreditCard(transactionId: string) {
    return async (
        actionRepo: ActionRepo,
        transactionRep: TransactionRepo,
        taskRepo: TaskRepo
    ) => {
        const transaction = await transactionRep.findReturnOrderById(transactionId);
        const potentialActions = transaction.potentialActions;
        const placeOrderTransaction = transaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;
        const authorizeActions = placeOrderTransaction.object.authorizeActions
            .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((action) => action.object.typeOf === factory.action.authorize.creditCard.ObjectType.CreditCard);

        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        if (placeOrderTransactionResult === undefined) {
            throw new factory.errors.NotFound('placeOrderTransaction.result');
        }

        await Promise.all(authorizeActions.map(async (authorizeAction) => {
            // アクション開始
            const refundActionAttributes = potentialActions.returnOrder.potentialActions.refund;
            const action = await actionRepo.start<factory.action.trade.refund.IAction>(refundActionAttributes);

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
                    // tslint:disable-next-line:max-line-length no-single-line-block-comment
                    const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : /* istanbul ignore next */ error;
                    await actionRepo.giveUp(refundActionAttributes.typeOf, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                throw new Error(error);
            }

            // アクション完了
            debug('ending action...');
            await actionRepo.complete(refundActionAttributes.typeOf, action.id, { alterTranResult });

            // 潜在アクション
            await onRefund(refundActionAttributes)(taskRepo);
        }));
    };
}

/**
 * 返金後のアクション
 * @param refundActionAttributes 返金アクション属性
 */
function onRefund(refundActionAttributes: factory.action.trade.refund.IAttributes) {
    return async (taskRepo: TaskRepo) => {
        const potentialActions = refundActionAttributes.potentialActions;
        const now = new Date();
        const taskAttributes: factory.task.IAttributes[] = [];
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (potentialActions.sendEmailMessage !== undefined) {
            taskAttributes.push(factory.task.sendEmailMessage.createAttributes({
                status: factory.taskStatus.Ready,
                runsAt: now, // なるはやで実行
                remainingNumberOfTries: 3,
                lastTriedAt: null,
                numberOfTried: 0,
                executionResults: [],
                data: {
                    actionAttributes: potentialActions.sendEmailMessage
                }
            }));
        }

        // タスク保管
        await Promise.all(taskAttributes.map(async (taskAttribute) => {
            return taskRepo.save(taskAttribute);
        }));
    };
}

/**
 * ムビチケ着券取消し
 * @export
 * @param transactionId 取引ID
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
 * @param transactionId 取引ID
 */
export function useMvtk(transactionId: string) {
    return async (actionRepo: ActionRepo, transactionRep: TransactionRepo) => {
        const transaction = await transactionRep.findPlaceOrderById(transactionId);
        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }
        const potentialActions = transaction.potentialActions;
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        const useActionAttributes = potentialActions.order.potentialActions.useMvtk;
        if (useActionAttributes !== undefined) {
            // ムビチケ承認アクションがあるはず
            // const authorizeAction = <factory.action.authorize.mvtk.IAction>transaction.object.authorizeActions
            //     .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            //     .find((a) => a.object.typeOf === factory.action.authorize.authorizeActionPurpose.Mvtk);

            // アクション開始
            const action = await actionRepo.start<factory.action.consume.use.mvtk.IAction>(useActionAttributes);

            try {
                // 実は取引成立の前に着券済みなので何もしない
            } catch (error) {
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */

                // actionにエラー結果を追加
                try {
                    // tslint:disable-next-line:max-line-length no-single-line-block-comment
                    const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : /* istanbul ignore next */ error;
                    await actionRepo.giveUp(useActionAttributes.typeOf, action.id, actionError);
                } catch (__) {
                    // 失敗したら仕方ない
                }

                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore next */
                throw new Error(error);
            }

            // アクション完了
            debug('ending action...');
            const actionResult: factory.action.consume.use.mvtk.IResult = {};
            await actionRepo.complete(useActionAttributes.typeOf, action.id, actionResult);
        }
    };
}
