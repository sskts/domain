/**
 * order service
 * @namespace service/order
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as googleLibphonenumber from 'google-libphonenumber';

import { MongoRepository as OrderRepo } from '../repo/order';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:order');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

export function createFromTransaction(transactionId: string) {
    return async (orderRepo: OrderRepo, transactionRepo: TransactionRepo) => {
        const transaction = await transactionRepo.findPlaceOrderById(transactionId);

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (transaction.result !== undefined) {
            await orderRepo.save(transaction.result.order);
        }
    };
}

export function cancelReservations(returnOrderTransactionId: string) {
    return async (orderRepo: OrderRepo, ownershipInfoRepo: OwnershipInfoRepo, transactionRepo: TransactionRepo) => {
        const now = new Date();
        const transaction = await transactionRepo.findReturnOrderById(returnOrderTransactionId);
        const placeOrderTransaction = transaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;

        if (placeOrderTransactionResult !== undefined) {
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
        }
    };
}
