/**
 * stock service
 * 在庫の管理に対して責任を負うサービス
 * @namespace service.stock
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { MongoRepository as SeatReservationAuthorizeActionRepo } from '../repo/action/authorize/seatReservation';
import { MongoRepository as TransactionRepo } from '../repo/transaction';

const debug = createDebug('sskts-domain:service:stock');

export type IPlaceOrderTransaction = factory.transaction.placeOrder.ITransaction;

/**
 * 資産承認解除(COA座席予約)
 * @export
 * @function
 * @memberof service.stock
 * @param {string} transactionId 取引ID
 */
export function cancelSeatReservationAuth(transactionId: string) {
    return async (seatReservationAuthorizeActionRepo: SeatReservationAuthorizeActionRepo) => {
        // 座席仮予約アクションを取得
        const authorizeActions: factory.action.authorize.seatReservation.IAction[] =
            await seatReservationAuthorizeActionRepo.findByTransactionId(transactionId)
                .then((actions) => actions.filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus));

        await Promise.all(authorizeActions.map(async (action) => {
            debug('calling deleteTmpReserve...');
            const updTmpReserveSeatArgs = (<factory.action.authorize.seatReservation.IResult>action.result).updTmpReserveSeatArgs;
            const updTmpReserveSeatResult = (<factory.action.authorize.seatReservation.IResult>action.result).updTmpReserveSeatResult;

            await COA.services.reserve.delTmpReserve({
                theaterCode: updTmpReserveSeatArgs.theaterCode,
                dateJouei: updTmpReserveSeatArgs.dateJouei,
                titleCode: updTmpReserveSeatArgs.titleCode,
                titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
                timeBegin: updTmpReserveSeatArgs.timeBegin,
                tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum
            });
        }));
    };
}

/**
 * 資産移動(COA座席予約)
 * @export
 * @function
 * @memberof service.stock
 * @param {string} transactionId 取引ID
 */
export function transferSeatReservation(transactionId: string) {
    return async (transactionRepository: TransactionRepo) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);
        const authorizeActions = transaction.object.authorizeActions
            .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
            .filter((action) => action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.SeatReservation);
        if (authorizeActions.length !== 1) {
            throw new factory.errors.NotImplemented('Number of seat reservation authorizeAction must be 1.');
        }

        const authorizeAction = authorizeActions[0];

        const updTmpReserveSeatArgs = (<factory.action.authorize.seatReservation.IResult>authorizeAction.result).updTmpReserveSeatArgs;
        const updTmpReserveSeatResult = (<factory.action.authorize.seatReservation.IResult>authorizeAction.result).updTmpReserveSeatResult;
        const order = (<factory.transaction.placeOrder.IResult>transaction.result).order;

        const customerContact = transaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.Argument('transaction', 'customer contact not created');
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
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
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
    };
}
