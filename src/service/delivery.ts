/**
 * 配送サービス
 * @namespace service.delivery
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { MongoRepository as ActionRepo } from '../repo/action';
import { MongoRepository as OwnershipInfoRepo } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:stock');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 注文を配送する
 * COAに本予約連携を行い、内部的には所有権を作成する
 * @param transactionId 注文取引ID
 */
export function sendOrder(transactionId: string) {
    return async (actionRepo: ActionRepo, ownershipInfoRepo: OwnershipInfoRepo, transactionRepo: TransactionRepo) => {
        const transaction = await transactionRepo.findPlaceOrderById(transactionId);
        const transactionResult = transaction.result;
        if (transactionResult === undefined) {
            throw new factory.errors.NotFound('transaction.result');
        }
        const potentialActions = transaction.potentialActions;
        if (potentialActions === undefined) {
            throw new factory.errors.NotFound('transaction.potentialActions');
        }

        const authorizeActions = <factory.action.authorize.seatReservation.IAction[]>transaction.object.authorizeActions
            .filter((a) => a.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((a) => a.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.SeatReservation);
        if (authorizeActions.length !== 1) {
            throw new factory.errors.NotImplemented('Number of seat reservation authorizeAction must be 1.');
        }

        const authorizeAction = authorizeActions[0];
        const authorizeActionResult = authorizeAction.result;
        if (authorizeActionResult === undefined) {
            throw new factory.errors.NotFound('authorizeAction.result');
        }

        // アクション開始
        const sendOrderActionAttributes = potentialActions.order.potentialActions.sendOrder;
        const action = await actionRepo.start<factory.action.transfer.send.order.IAction>(sendOrderActionAttributes);

        try {
            const updTmpReserveSeatArgs = authorizeActionResult.updTmpReserveSeatArgs;
            const updTmpReserveSeatResult = authorizeActionResult.updTmpReserveSeatResult;
            const order = transactionResult.order;

            const customerContact = transaction.object.customerContact;
            if (customerContact === undefined) {
                throw new factory.errors.NotFound('transaction.object.customerContact');
            }

            // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
            const phoneUtil = PhoneNumberUtil.getInstance();
            const phoneNumber = phoneUtil.parse(customerContact.telephone, 'JP');
            let telNum = phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);

            // COAでは数字のみ受け付けるので数字以外を除去
            telNum = telNum.replace(/[^\d]/g, '');

            // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
            // すでに本予約済みかどうか確認
            const stateReserveResult = await COA.services.reserve.stateReserve({
                theaterCode: updTmpReserveSeatArgs.theaterCode,
                reserveNum: updTmpReserveSeatResult.tmpReserveNum,
                telNum: telNum
            });

            // COA本予約
            // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
            if (stateReserveResult === null) {
                await COA.services.reserve.updReserve({
                    theaterCode: updTmpReserveSeatArgs.theaterCode,
                    dateJouei: updTmpReserveSeatArgs.dateJouei,
                    titleCode: updTmpReserveSeatArgs.titleCode,
                    titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
                    timeBegin: updTmpReserveSeatArgs.timeBegin,
                    tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum,
                    reserveName: `${customerContact.familyName}　${customerContact.givenName}`,
                    reserveNameJkana: `${customerContact.familyName}　${customerContact.givenName}`,
                    telNum: telNum,
                    mailAddr: customerContact.email,
                    reserveAmount: order.price, // デフォルトのpriceCurrencyがJPYなのでこれでよし
                    listTicket: order.acceptedOffers.map((offer) => offer.itemOffered.reservedTicket.coaTicketInfo)
                });
            }

            await Promise.all(transactionResult.ownershipInfos.map(async (ownershipInfo) => {
                await ownershipInfoRepo.save(ownershipInfo);
            }));
        } catch (error) {
            // actionにエラー結果を追加
            try {
                const actionError = (error instanceof Error) ? { ...error, ...{ message: error.message } } : error;
                await actionRepo.giveUp(sendOrderActionAttributes.typeOf, action.id, actionError);
            } catch (__) {
                // 失敗したら仕方ない
            }

            throw new Error(error);
        }

        // アクション完了
        debug('ending action...');
        await actionRepo.complete(sendOrderActionAttributes.typeOf, action.id, {});
    };
}
