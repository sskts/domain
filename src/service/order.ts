/**
 * 注文サービス
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as googleLibphonenumber from 'google-libphonenumber';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TaskRepo } from '../repo/task';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:order');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 注文取引結果から注文を作成する
 * @param transactionId 注文取引ID
 */
export function createFromTransaction(transactionId: string) {
    return async (actionRepo: ActionRepo, orderRepo: OrderRepo, transactionRepo: TransactionRepo, taskRepo: TaskRepo) => {
        const transaction = await transactionRepo.findPlaceOrderById(transactionId);
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
        const action = await actionRepo.start<factory.action.trade.order.IAction>(orderActionAttributes);

        try {
            // 注文保管
            await orderRepo.createIfNotExist(transactionResult.order);

            // potentialActionsのためのタスクを生成
            const orderPotentialActions = potentialActions.order.potentialActions;
            const now = new Date();
            const taskAttributes: factory.task.IAttributes[] = [];
            if (orderPotentialActions.sendOrder !== undefined) {
                taskAttributes.push(factory.task.settleSeatReservation.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                taskAttributes.push(factory.task.createOwnershipInfos.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
            }

            // クレジットカード決済
            if (orderPotentialActions.payCreditCard !== undefined) {
                taskAttributes.push(factory.task.settleCreditCard.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
            }

            // ムビチケ使用
            if (orderPotentialActions.useMvtk !== undefined) {
                taskAttributes.push(factory.task.settleMvtk.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: now, // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
            }

            // タスク保管
            await Promise.all(taskAttributes.map(async (taskAttribute) => {
                return taskRepo.save(taskAttribute);
            }));
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                await actionRepo.giveUp(orderActionAttributes.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new Error(error);
        }

        // アクション完了
        debug('ending action...');
        await actionRepo.complete(orderActionAttributes.typeOf, action.id, {});
    };
}

export function cancelReservations(returnOrderTransactionId: string) {
    return async (
        actionRepo: ActionRepo,
        orderRepo: OrderRepo,
        ownershipInfoRepo: OwnershipInfoRepo,
        transactionRepo: TransactionRepo
    ) => {
        const now = new Date();
        const transaction = await transactionRepo.findReturnOrderById(returnOrderTransactionId);
        const placeOrderTransaction = transaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;

        if (transaction.result === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }

        if (placeOrderTransactionResult === undefined) {
            throw new factory.errors.NotFound('placeOrderTransaction.result');
        }

        // アクション開始
        const returnOrderActionAttributes = transaction.result.postActions.returnOrderAction;
        const action = await actionRepo.start<factory.action.transfer.returnAction.order.IAction>(returnOrderActionAttributes);

        try {
            const order = placeOrderTransactionResult.order;

            // 非同期でCOA本予約取消
            // COAから内容抽出
            // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
            const phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(order.orderInquiryKey.telephone, 'JP');
            let telNum = phoneUtil.format(phoneNumber, googleLibphonenumber.PhoneNumberFormat.NATIONAL);
            // COAでは数字のみ受け付けるので数字以外を除去
            telNum = telNum.replace(/[^\d]/g, '');
            const stateReserveResult = await COA.services.reserve.stateReserve({
                theaterCode: order.orderInquiryKey.theaterCode,
                reserveNum: order.orderInquiryKey.confirmationNumber,
                telNum: telNum
            });
            debug('COA stateReserveResult is', stateReserveResult);

            // 予約が存在すればCOA購入チケット取消
            if (stateReserveResult !== null) {
                debug('deleting COA reservation...');
                await COA.services.reserve.delReserve({
                    theaterCode: order.orderInquiryKey.theaterCode,
                    reserveNum: order.orderInquiryKey.confirmationNumber,
                    telNum: telNum,
                    dateJouei: stateReserveResult.dateJouei,
                    titleCode: stateReserveResult.titleCode,
                    titleBranchNum: stateReserveResult.titleBranchNum,
                    timeBegin: stateReserveResult.timeBegin,
                    listSeat: stateReserveResult.listTicket
                });
                debug('COA delReserve processed.');
            }

            // 所有権無効化(所有期間を現在までに変更する)
            const ownershipInfos = placeOrderTransactionResult.ownershipInfos;
            debug('invalidating ownershipInfos...', ownershipInfos);
            await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
                await ownershipInfoRepo.ownershipInfoModel.findOneAndUpdate(
                    { identifier: ownershipInfo.identifier },
                    { ownedThrough: now }
                ).exec();
            }));

            // 注文ステータス変更
            debug('changing orderStatus...');
            await orderRepo.orderModel.findOneAndUpdate(
                { orderNumber: order.orderNumber },
                { orderStatus: factory.orderStatus.OrderReturned }
            ).exec();
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                await actionRepo.giveUp(returnOrderActionAttributes.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new Error(error);
        }

        // アクション完了
        debug('ending action...');
        await actionRepo.complete(returnOrderActionAttributes.typeOf, action.id, {});
    };
}
