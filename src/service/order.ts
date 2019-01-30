/**
 * 注文サービス
 */
import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as googleLibphonenumber from 'google-libphonenumber';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

import * as factory from '../factory';

const debug = createDebug('sskts-domain:service:order');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;
export type IReservation = factory.reservation.event.IEventReservation<factory.event.screeningEvent.IEvent>;

/**
 * 注文取引結果から注文を作成する
 * @param transactionId 注文取引ID
 */
export function createFromTransaction(transactionId: string) {
    return async (repos: {
        action: ActionRepo;
        order: OrderRepo;
        transaction: TransactionRepo;
        task: TaskRepo;
    }) => {
        const transaction = await repos.transaction.findById({
            typeOf: factory.transactionType.PlaceOrder,
            id: transactionId
        });
        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }
        const potentialActions = transaction.potentialActions;
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        // アクション開始
        const orderActionAttributes = potentialActions.order;
        const action = await repos.action.start(orderActionAttributes);

        try {
            // 注文保管
            await repos.order.createIfNotExist(transactionResult.order);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await repos.action.giveUp(orderActionAttributes.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        await repos.action.complete(orderActionAttributes.typeOf, action.id, {});

        // 潜在アクション
        await onCreate(transactionId, orderActionAttributes)({ task: repos.task });
    };
}

/**
 * 注文作成後のアクション
 * @param transactionId 注文取引ID
 * @param orderActionAttributes 注文アクション属性
 */
function onCreate(transactionId: string, orderActionAttributes: factory.action.trade.order.IAttributes) {
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
                const sendOrderTask: factory.task.sendOrder.IAttributes = {
                    name: factory.taskName.SendOrder,
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transactionId
                    }
                };
                taskAttributes.push(sendOrderTask);
            }

            // クレジットカード決済
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (orderPotentialActions.payCreditCard !== undefined) {
                const payCreditCardTask: factory.task.payCreditCard.IAttributes = {
                    name: factory.taskName.PayCreditCard,
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transactionId
                    }
                };
                taskAttributes.push(payCreditCardTask);
            }

            // Pecorino決済
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(orderPotentialActions.payAccount)) {
                taskAttributes.push(...orderPotentialActions.payAccount.map((a): factory.task.IAttributes<factory.taskName.PayAccount> => {
                    return {
                        name: factory.taskName.PayAccount,
                        status: factory.taskStatus.Ready,
                        runsAt: now, // なるはやで実行
                        remainingNumberOfTries: 10,
                        lastTriedAt: null,
                        numberOfTried: 0,
                        executionResults: [],
                        data: a
                    };
                }));
            }

            // ムビチケ使用
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (orderPotentialActions.useMvtk !== undefined) {
                const useMvtkTask: factory.task.useMvtk.IAttributes = {
                    name: factory.taskName.UseMvtk,
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transactionId
                    }
                };
                taskAttributes.push(useMvtkTask);
            }

            // Pecorinoポイント付与
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(orderPotentialActions.givePecorinoAward)) {
                taskAttributes.push(...orderPotentialActions.givePecorinoAward.map((a): factory.task.givePecorinoAward.IAttributes => {
                    return {
                        name: factory.taskName.GivePecorinoAward,
                        status: factory.taskStatus.Ready,
                        runsAt: now, // なるはやで実行
                        remainingNumberOfTries: 10,
                        lastTriedAt: null,
                        numberOfTried: 0,
                        executionResults: [],
                        data: a
                    };
                }));
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
 * @param returnOrderTransactionId 注文返品取引ID
 */
export function cancelReservations(returnOrderTransactionId: string) {
    return async (
        actionRepo: ActionRepo,
        orderRepo: OrderRepo,
        ownershipInfoRepo: OwnershipInfoRepo,
        transactionRepo: TransactionRepo,
        taskRepo: TaskRepo
    ) => {
        const transaction = await transactionRepo.findById({
            typeOf: factory.transactionType.ReturnOrder,
            id: returnOrderTransactionId
        });
        const potentialActions = transaction.potentialActions;
        const placeOrderTransaction = transaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;

        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }
        if (placeOrderTransactionResult === undefined) {
            throw new factory.errors.NotFound('placeOrderTransaction.result');
        }

        // アクション開始
        const returnOrderActionAttributes = potentialActions.returnOrder;
        const action = await actionRepo.start(returnOrderActionAttributes);

        try {
            const order = placeOrderTransactionResult.order;
            const reservation = <IReservation>order.acceptedOffers[0].itemOffered;

            // 非同期でCOA本予約取消
            // COAから内容抽出
            // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
            const phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(order.customer.telephone, 'JP');
            let telNum = phoneUtil.format(phoneNumber, googleLibphonenumber.PhoneNumberFormat.NATIONAL);
            // COAでは数字のみ受け付けるので数字以外を除去
            telNum = telNum.replace(/[^\d]/g, '');
            const stateReserveResult = await COA.services.reserve.stateReserve({
                theaterCode: reservation.reservationFor.superEvent.location.branchCode,
                reserveNum: Number(reservation.reservationNumber),
                telNum: telNum
            });
            debug('COA stateReserveResult is', stateReserveResult);

            // 予約が存在すればCOA購入チケット取消
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (stateReserveResult !== null) {
                debug('deleting COA reservation...');
                await COA.services.reserve.delReserve({
                    theaterCode: reservation.reservationFor.superEvent.location.branchCode,
                    reserveNum: Number(reservation.reservationNumber),
                    telNum: telNum,
                    dateJouei: stateReserveResult.dateJouei,
                    titleCode: stateReserveResult.titleCode,
                    titleBranchNum: stateReserveResult.titleBranchNum,
                    timeBegin: stateReserveResult.timeBegin,
                    listSeat: stateReserveResult.listTicket
                });
                debug('COA delReserve processed.');
            }

            // 所有権の予約ステータスを変更
            const ownershipInfos = placeOrderTransactionResult.ownershipInfos;
            debug('invalidating ownershipInfos...', ownershipInfos);
            await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
                await ownershipInfoRepo.ownershipInfoModel.findOneAndUpdate(
                    { identifier: ownershipInfo.identifier },
                    { 'typeOfGood.reservationStatus': factory.reservationStatusType.ReservationCancelled }
                ).exec();
            }));

            // 注文ステータス変更
            debug('changing orderStatus...');
            await orderRepo.changeStatus(order.orderNumber, factory.orderStatus.OrderReturned);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = { ...error, ...{ message: error.message, name: error.name } };
                await actionRepo.giveUp(returnOrderActionAttributes.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw error;
        }

        // アクション完了
        debug('ending action...');
        await actionRepo.complete(returnOrderActionAttributes.typeOf, action.id, {});

        // 潜在アクション
        await onReturn(returnOrderTransactionId, returnOrderActionAttributes)(taskRepo);
    };
}

/**
 * 返品アクション後の処理
 * 注文返品後に何をすべきかは返品アクションのpotentialActionsとして定義されているはずなので、それらをタスクとして登録します。
 * @param transactionId 注文返品取引ID
 * @param returnActionAttributes 返品アクション属性
 */
function onReturn(transactionId: string, returnActionAttributes: factory.action.transfer.returnAction.order.IAttributes) {
    return async (taskRepo: TaskRepo) => {
        const now = new Date();
        const taskAttributes: factory.task.IAttributes<factory.taskName>[] = [];

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (returnActionAttributes.potentialActions !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (returnActionAttributes.potentialActions.refundCreditCard !== undefined) {
                // 返金タスク作成
                const task: factory.task.refundCreditCard.IAttributes = {
                    name: factory.taskName.RefundCreditCard,
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transactionId
                    }
                };
                taskAttributes.push(task);
            }

            // Pecorino返金タスク
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
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: a
                        };
                    }
                ));
            }

            // Pecorinoインセンティブ返却タスク
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(returnActionAttributes.potentialActions.returnPecorinoAward)) {
                taskAttributes.push(...returnActionAttributes.potentialActions.returnPecorinoAward.map(
                    (a): factory.task.returnPecorinoAward.IAttributes => {
                        return {
                            name: factory.taskName.ReturnPecorinoAward,
                            status: factory.taskStatus.Ready,
                            runsAt: now, // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
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
            return taskRepo.save(taskAttribute);
        }));
    };
}
