/**
 * 注文サービス
 */
import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as googleLibphonenumber from 'google-libphonenumber';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as InvoiceRepo } from '../repo/invoice';
import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as factory from '../factory';

const debug = createDebug('sskts-domain:service:order');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export type IReservation = factory.reservation.event.IReservation<factory.event.screeningEvent.IEvent>;

/**
 * 注文取引から注文を作成する
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
export function placeOrder(params: factory.action.trade.order.IAttributes) {
    return async (repos: {
        action: ActionRepo;
        invoice: InvoiceRepo;
        order: OrderRepo;
        transaction: TransactionRepo;
        task: TaskRepo;
    }) => {
        const order = params.object;
        const placeOrderTransactions = await repos.transaction.search<factory.transactionType.PlaceOrder>({
            typeOf: factory.transactionType.PlaceOrder,
            result: { order: { orderNumbers: [order.orderNumber] } }
        });
        const placeOrderTransaction = placeOrderTransactions.shift();
        if (placeOrderTransaction === undefined) {
            throw new factory.errors.NotFound('Transaction');
        }

        // アクション開始
        const orderActionAttributes = params;
        const action = await repos.action.start(orderActionAttributes);

        try {
            // 注文保管
            await repos.order.createIfNotExist(order);

            // 請求書作成
            const invoices: factory.invoice.IInvoice[] = [];
            Object.keys(factory.paymentMethodType)
                .forEach((key) => {
                    const paymentMethodType = <factory.paymentMethodType>(<any>factory.paymentMethodType)[key];
                    placeOrderTransaction.object.authorizeActions
                        .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
                        .filter((a) => a.result !== undefined)
                        .filter((a) => a.result.paymentMethod === paymentMethodType)
                        .forEach((a: factory.action.authorize.paymentMethod.any.IAction<factory.paymentMethodType>) => {
                            const result = (<factory.action.authorize.paymentMethod.any.IResult<factory.paymentMethodType>>a.result);

                            // 決済方法と決済IDごとに金額をまとめて請求書を作成する
                            const existingInvoiceIndex = invoices.findIndex((i) => {
                                return i.paymentMethod === paymentMethodType && i.paymentMethodId === result.paymentMethodId;
                            });

                            if (existingInvoiceIndex < 0) {
                                invoices.push({
                                    typeOf: 'Invoice',
                                    accountId: result.accountId,
                                    confirmationNumber: order.confirmationNumber.toString(),
                                    customer: order.customer,
                                    paymentMethod: paymentMethodType,
                                    paymentMethodId: result.paymentMethodId,
                                    paymentStatus: result.paymentStatus,
                                    referencesOrder: <any>order,
                                    totalPaymentDue: result.totalPaymentDue
                                });
                            } else {
                                const existingInvoice = invoices[existingInvoiceIndex];
                                if (
                                    existingInvoice.totalPaymentDue !== undefined
                                    && existingInvoice.totalPaymentDue.value !== undefined
                                    && result.totalPaymentDue !== undefined
                                    && result.totalPaymentDue.value !== undefined
                                ) {
                                    existingInvoice.totalPaymentDue.value += result.totalPaymentDue.value;
                                }
                            }
                        });
                });

            await Promise.all(invoices.map(async (invoice) => {
                await repos.invoice.createIfNotExist(invoice);
            }));
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp({ typeOf: orderActionAttributes.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        await repos.action.complete({ typeOf: orderActionAttributes.typeOf, id: action.id, result: {} });

        // 潜在アクション
        await onPlaceOrder(orderActionAttributes)({ task: repos.task });
    };
}

/**
 * 注文作成後のアクション
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
function onPlaceOrder(orderActionAttributes: factory.action.trade.order.IAttributes) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: { task: TaskRepo }) => {
        // potentialActionsのためのタスクを生成
        const orderPotentialActions = orderActionAttributes.potentialActions;
        const now = new Date();
        const taskAttributes: factory.task.IAttributes<factory.taskName>[] = [];

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (orderPotentialActions !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (orderPotentialActions.sendOrder !== undefined) {
                const sendOrderTask: factory.task.IAttributes<factory.taskName.SendOrder> = {
                    name: factory.taskName.SendOrder,
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    numberOfTried: 0,
                    executionResults: [],
                    data: orderPotentialActions.sendOrder
                };
                taskAttributes.push(sendOrderTask);
            }

            // 予約確定
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(orderPotentialActions.confirmReservation)) {
                taskAttributes.push(...orderPotentialActions.confirmReservation.map(
                    (a): factory.task.IAttributes<factory.taskName.ConfirmReservation> => {
                        return {
                            name: factory.taskName.ConfirmReservation,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    }));
            }

            // クレジットカード決済
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (orderPotentialActions.payCreditCard !== undefined) {
                taskAttributes.push(...orderPotentialActions.payCreditCard.map(
                    (a): factory.task.IAttributes<factory.taskName.PayCreditCard> => {
                        return {
                            name: factory.taskName.PayCreditCard,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    }));
            }

            // ポイント決済
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(orderPotentialActions.payAccount)) {
                taskAttributes.push(...orderPotentialActions.payAccount.map((a): factory.task.IAttributes<factory.taskName.PayAccount> => {
                    return {
                        name: factory.taskName.PayAccount,
                        status: factory.taskStatus.Ready,
                        runsAt: now, // なるはやで実行
                        remainingNumberOfTries: 10,
                        numberOfTried: 0,
                        executionResults: [],
                        data: a
                    };
                }));
            }

            // ムビチケ使用
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            // if (orderPotentialActions.useMvtk !== undefined) {
            //     const useMvtkTask: factory.task.IAttributes<factory.taskName.PayMovieTicket> = {
            //         name: factory.taskName.PayMovieTicket,
            //         status: factory.taskStatus.Ready,
            //         runsAt: now, // なるはやで実行
            //         remainingNumberOfTries: 10,
            //         numberOfTried: 0,
            //         executionResults: [],
            //         data: {
            //             transactionId: transactionId
            //         }
            //     };
            //     taskAttributes.push(useMvtkTask);
            // }

            // ポイント付与
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(orderPotentialActions.givePointAward)) {
                taskAttributes.push(
                    ...orderPotentialActions.givePointAward.map((a): factory.task.IAttributes<factory.taskName.GivePointAward> => {
                        return {
                            name: factory.taskName.GivePointAward,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    })
                );
            }
        }

        // タスク保管
        await Promise.all(taskAttributes.map(async (taskAttribute) => {
            return repos.task.save(taskAttribute);
        }));
    };
}

/**
 * 注文返品アクション
 */
export function cancelReservations(params: { orderNumber: string }) {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        order: OrderRepo;
        ownershipInfo: OwnershipInfoRepo;
        transaction: TransactionRepo;
        task: TaskRepo;
    }) => {
        const returnOrderTransactions = await repos.transaction.search<factory.transactionType.ReturnOrder>({
            typeOf: factory.transactionType.ReturnOrder,
            object: {
                order: { orderNumbers: [params.orderNumber] }
            }
        });
        const returnOrderTransaction = returnOrderTransactions.shift();
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (returnOrderTransaction === undefined) {
            throw new factory.errors.NotFound('Return order transaction');
        }
        const potentialActions = returnOrderTransaction.potentialActions;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('PotentialActions of return order transaction');
        }

        const placeOrderTransactions = await repos.transaction.search<factory.transactionType.PlaceOrder>({
            typeOf: factory.transactionType.PlaceOrder,
            result: {
                order: { orderNumbers: [params.orderNumber] }
            }
        });
        const placeOrderTransaction = placeOrderTransactions.shift();
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (placeOrderTransaction === undefined) {
            throw new factory.errors.NotFound('Place order transaction');
        }
        const placeOrderTransactionResult = placeOrderTransaction.result;
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (placeOrderTransactionResult === undefined) {
            throw new factory.errors.NotFound('Result of place order transaction');
        }

        // アクション開始
        const returnOrderActionAttributes = potentialActions.returnOrder;
        const action = await repos.action.start(returnOrderActionAttributes);

        try {
            const order = returnOrderTransaction.object.order;
            const itemOffered = order.acceptedOffers[0].itemOffered;

            // 座席予約の場合キャンセル
            if (itemOffered.typeOf === factory.reservationType.EventReservation) {
                // 非同期でCOA本予約取消
                // COAから内容抽出
                // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
                const phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();
                const phoneNumber = phoneUtil.parse(order.customer.telephone, 'JP');
                let telNum = phoneUtil.format(phoneNumber, googleLibphonenumber.PhoneNumberFormat.NATIONAL);
                // COAでは数字のみ受け付けるので数字以外を除去
                telNum = telNum.replace(/[^\d]/g, '');
                const stateReserveResult = await COA.services.reserve.stateReserve({
                    theaterCode: itemOffered.reservationFor.superEvent.location.branchCode,
                    reserveNum: Number(itemOffered.reservationNumber),
                    telNum: telNum
                });
                debug('COA stateReserveResult is', stateReserveResult);

                // 予約が存在すればCOA購入チケット取消
                // tslint:disable-next-line:no-single-line-block-comment
                /* istanbul ignore else */
                if (stateReserveResult !== null) {
                    debug('deleting COA reservation...');
                    await COA.services.reserve.delReserve({
                        theaterCode: itemOffered.reservationFor.superEvent.location.branchCode,
                        reserveNum: Number(itemOffered.reservationNumber),
                        telNum: telNum,
                        dateJouei: stateReserveResult.dateJouei,
                        titleCode: stateReserveResult.titleCode,
                        titleBranchNum: stateReserveResult.titleBranchNum,
                        timeBegin: stateReserveResult.timeBegin,
                        listSeat: stateReserveResult.listTicket
                    });
                    debug('COA delReserve processed.');
                }
            }

            // 所有権の期限変更
            const ownershipInfos = placeOrderTransactionResult.ownershipInfos;
            debug('invalidating ownershipInfos...', ownershipInfos);
            await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
                // await repos.ownershipInfo.ownershipInfoModel.findOneAndUpdate(
                //     { identifier: ownershipInfo.identifier },
                //     { 'typeOfGood.reservationStatus': factory.reservationStatusType.ReservationCancelled }
                // ).exec();

                await repos.ownershipInfo.ownershipInfoModel.findOneAndUpdate(
                    { identifier: ownershipInfo.identifier },
                    { ownedThrough: new Date() }
                ).exec();
            }));

            // 注文ステータス変更
            debug('changing orderStatus...');
            await repos.order.changeStatus({
                orderNumber: order.orderNumber,
                orderStatus: factory.orderStatus.OrderReturned
            });
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp({ typeOf: returnOrderActionAttributes.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        await repos.action.complete({ typeOf: returnOrderActionAttributes.typeOf, id: action.id, result: {} });

        // 潜在アクション
        await onReturn(returnOrderActionAttributes)({ task: repos.task });
    };
}

/**
 * 返品アクション後の処理
 * 注文返品後に何をすべきかは返品アクションのpotentialActionsとして定義されているはずなので、それらをタスクとして登録します。
 */
function onReturn(returnActionAttributes: factory.action.transfer.returnAction.order.IAttributes) {
    return async (repos: {
        task: TaskRepo;
    }) => {
        const now = new Date();
        const taskAttributes: factory.task.IAttributes<factory.taskName>[] = [];

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (returnActionAttributes.potentialActions !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(returnActionAttributes.potentialActions.refundCreditCard)) {
                taskAttributes.push(...returnActionAttributes.potentialActions.refundCreditCard.map(
                    (a): factory.task.IAttributes<factory.taskName.RefundCreditCard> => {
                        return {
                            name: factory.taskName.RefundCreditCard,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    }
                ));
            }

            // ポイント返金タスク
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(returnActionAttributes.potentialActions.refundAccount)) {
                taskAttributes.push(...returnActionAttributes.potentialActions.refundAccount.map(
                    (a): factory.task.IAttributes<factory.taskName.RefundAccount> => {
                        return {
                            name: factory.taskName.RefundAccount,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    }
                ));
            }

            // ポイントインセンティブ返却タスク
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(returnActionAttributes.potentialActions.returnPointAward)) {
                taskAttributes.push(...returnActionAttributes.potentialActions.returnPointAward.map(
                    (a): factory.task.IAttributes<factory.taskName.ReturnPointAward> => {
                        return {
                            name: factory.taskName.ReturnPointAward,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    }
                ));
            }
        }

        // タスク保管
        await Promise.all(taskAttributes.map(async (taskAttribute) => {
            return repos.task.save(taskAttribute);
        }));
    };
}
