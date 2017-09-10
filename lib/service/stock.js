"use strict";
/**
 * stock service
 * 在庫の管理に対して責任を負うサービス
 * @namespace service.stock
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:stock');
/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
function unauthorizeSeatReservation(transactionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderById(transactionId);
        const authorizeAction = transaction.object.authorizeActions.find((action) => {
            return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.SeatReservation;
        });
        if (authorizeAction === undefined) {
            return;
        }
        debug('calling deleteTmpReserve...');
        const updTmpReserveSeatArgs = authorizeAction.result.updTmpReserveSeatArgs;
        const updTmpReserveSeatResult = authorizeAction.result.updTmpReserveSeatResult;
        yield COA.services.reserve.delTmpReserve({
            theaterCode: updTmpReserveSeatArgs.theaterCode,
            dateJouei: updTmpReserveSeatArgs.dateJouei,
            titleCode: updTmpReserveSeatArgs.titleCode,
            titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum
        });
    });
}
exports.unauthorizeSeatReservation = unauthorizeSeatReservation;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorizeAction
 * @memberof service/stock
 */
function transferSeatReservation(transactionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderById(transactionId);
        const authorizeAction = transaction.object.authorizeActions.find((action) => {
            return action.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.SeatReservation;
        });
        if (authorizeAction === undefined) {
            return;
        }
        const updTmpReserveSeatArgs = authorizeAction.result.updTmpReserveSeatArgs;
        const updTmpReserveSeatResult = authorizeAction.result.updTmpReserveSeatResult;
        const acceptedOffers = transaction.result.order.acceptedOffers;
        const customerContact = transaction.object.customerContact;
        if (customerContact === undefined) {
            throw new factory.errors.Argument('transaction', 'customer contact not created');
        }
        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = yield COA.services.reserve.stateReserve({
            theaterCode: updTmpReserveSeatArgs.theaterCode,
            reserveNum: updTmpReserveSeatResult.tmpReserveNum,
            telNum: customerContact.telephone
        });
        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = yield COA.services.reserve.updReserve({
                theaterCode: updTmpReserveSeatArgs.theaterCode,
                dateJouei: updTmpReserveSeatArgs.dateJouei,
                titleCode: updTmpReserveSeatArgs.titleCode,
                titleBranchNum: updTmpReserveSeatArgs.titleBranchNum,
                timeBegin: updTmpReserveSeatArgs.timeBegin,
                tmpReserveNum: updTmpReserveSeatResult.tmpReserveNum,
                reserveName: `${customerContact.familyName}　${customerContact.givenName}`,
                reserveNameJkana: `${customerContact.familyName}　${customerContact.givenName}`,
                // tslint:disable-next-line:no-suspicious-comment
                telNum: customerContact.telephone,
                mailAddr: customerContact.email,
                reserveAmount: acceptedOffers.reduce((a, b) => a + b.price, 0),
                listTicket: acceptedOffers.map((offer) => offer.itemOffered.reservedTicket.coaTicketInfo)
            });
        }
    });
}
exports.transferSeatReservation = transferSeatReservation;
