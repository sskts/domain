/**
 * stock service
 * 在庫の管理に対して責任を負うサービス
 * @namespace service/stock
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

import { MongoRepository as OwnershipInfoRepository } from '../repo/ownershipInfo';
import { MongoRepository as TransactionRepository } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:stock');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
export function unauthorizeSeatReservation(transactionId: string) {
    return async (transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        if (transaction.object.seatReservation === undefined) {
            return;
        }

        debug('calling deleteTmpReserve...');
        const authorizeAction = transaction.object.seatReservation;
        const updTmpReserveSeatArgs = (<factory.action.authorize.seatReservation.IResult>authorizeAction.result).updTmpReserveSeatArgs;
        const updTmpReserveSeatResult = (<factory.action.authorize.seatReservation.IResult>authorizeAction.result).updTmpReserveSeatResult;

        await COA.services.reserve.delTmpReserve({
            theaterCode: updTmpReserveSeatArgs.theaterCode,
            dateJouei: updTmpReserveSeatArgs.dateJouei,
            titleCode: updTmpReserveSeatArgs.titleCode,
            titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum
        });
    };
}

/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorizeAction
 * @memberof service/stock
 */
export function transferSeatReservation(transactionId: string) {
    // tslint:disable-next-line:max-func-body-length
    return async (ownershipInfoRepository: OwnershipInfoRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        if (transaction.object.seatReservation === undefined) {
            return;
        }

        const authorizeAction = transaction.object.seatReservation;
        const updTmpReserveSeatArgs = (<factory.action.authorize.seatReservation.IResult>authorizeAction.result).updTmpReserveSeatArgs;
        const updTmpReserveSeatResult = (<factory.action.authorize.seatReservation.IResult>authorizeAction.result).updTmpReserveSeatResult;
        const acceptedOffers = (<factory.transaction.placeOrder.IResult>transaction.result).order.acceptedOffers;

        const customerContact = transaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.Argument('transaction', 'customer contact not created');
        }

        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = await COA.services.reserve.stateReserve({
            theaterCode: updTmpReserveSeatArgs.theaterCode,
            reserveNum: updTmpReserveSeatResult.tmpReserveNum,
            telNum: customerContact.telephone
        });

        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult: COA.services.reserve.IUpdReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = await COA.services.reserve.updReserve({
                theaterCode: updTmpReserveSeatArgs.theaterCode,
                dateJouei: updTmpReserveSeatArgs.dateJouei,
                titleCode: updTmpReserveSeatArgs.titleCode,
                titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
                timeBegin: updTmpReserveSeatArgs.timeBegin,
                tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum,
                reserveName: `${customerContact.familyName}　${customerContact.givenName}`,
                reserveNameJkana: `${customerContact.familyName}　${customerContact.givenName}`,
                telNum: customerContact.telephone,
                mailAddr: customerContact.email,
                reserveAmount: acceptedOffers.reduce(
                    (a, b) => a + b.price,
                    0
                ),
                listTicket: acceptedOffers.map((offer) => offer.itemOffered.reservedTicket.coaTicketInfo)
            });
        }

        // 資産永続化(リトライできるように)
        if (transaction.result !== undefined) {
            await Promise.all(transaction.result.ownershipInfos.map(async (ownershipInfo) => {
                // 所有権永続化
                await ownershipInfoRepository.save(ownershipInfo);
            }));
        }
    };
}
