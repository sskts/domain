"use strict";
/**
 * 在庫サービス
 *
 * @namespace service/stock
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
const createDebug = require("debug");
const argument_1 = require("../error/argument");
const debug = createDebug('sskts-domain:service:stock');
/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
function unauthorizeSeatReservation(transactionId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
        }
        if (transaction.object.seatReservation === undefined) {
            return;
        }
        debug('calling deleteTmpReserve...');
        const authorization = transaction.object.seatReservation;
        yield COA.services.reserve.delTmpReserve({
            theaterCode: authorization.object.updTmpReserveSeatArgs.theaterCode,
            dateJouei: authorization.object.updTmpReserveSeatArgs.dateJouei,
            titleCode: authorization.object.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: authorization.object.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: authorization.object.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: authorization.result.tmpReserveNum
        });
    });
}
exports.unauthorizeSeatReservation = unauthorizeSeatReservation;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorization
 * @memberof service/stock
 */
function transferSeatReservation(transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (ownershipInfoAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionAdapter.findPlaceOrderById(transactionId);
        if (transaction === null) {
            throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
        }
        if (transaction.object.seatReservation === undefined) {
            return;
        }
        const authorization = transaction.object.seatReservation;
        const customerContact = transaction.object.customerContact;
        if (customerContact === undefined) {
            throw new argument_1.default('transaction', 'customer contact not created');
        }
        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = yield COA.services.reserve.stateReserve({
            theaterCode: authorization.object.updTmpReserveSeatArgs.theaterCode,
            reserveNum: authorization.result.tmpReserveNum,
            telNum: customerContact.telephone
        });
        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = yield COA.services.reserve.updReserve({
                theaterCode: authorization.object.updTmpReserveSeatArgs.theaterCode,
                dateJouei: authorization.object.updTmpReserveSeatArgs.dateJouei,
                titleCode: authorization.object.updTmpReserveSeatArgs.titleCode,
                titleBranchNum: authorization.object.updTmpReserveSeatArgs.titleBranchNum,
                timeBegin: authorization.object.updTmpReserveSeatArgs.timeBegin,
                tmpReserveNum: authorization.result.tmpReserveNum,
                reserveName: `${customerContact.familyName}　${customerContact.givenName}`,
                reserveNameJkana: `${customerContact.familyName}　${customerContact.givenName}`,
                telNum: customerContact.telephone,
                mailAddr: customerContact.email,
                reserveAmount: authorization.object.acceptedOffers.reduce((a, b) => a + b.price, 0),
                listTicket: authorization.object.acceptedOffers.map((offer) => offer.itemOffered.reservedTicket.coaTicketInfo)
            });
        }
        // 資産永続化(リトライできるように)
        if (transaction.result !== undefined) {
            yield Promise.all(transaction.result.ownershipInfos.map((ownershipInfo) => __awaiter(this, void 0, void 0, function* () {
                // 所有権永続化
                yield ownershipInfoAdapter.ownershipInfoModel.findOneAndUpdate({
                    identifier: ownershipInfo.identifier
                }, ownershipInfo, { upsert: true }).exec();
            })));
        }
    });
}
exports.transferSeatReservation = transferSeatReservation;
