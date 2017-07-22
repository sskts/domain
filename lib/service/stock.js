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
const moment = require("moment");
const _ = require("underscore");
const argument_1 = require("../error/argument");
const OwnershipInfoFactory = require("../factory/ownershipInfo");
const reservationStatusType_1 = require("../factory/reservationStatusType");
const debug = createDebug('sskts-domain:service:stock');
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {ICOASeatReservationAuthorization} authorization
 * @memberof service/stock
 */
function unauthorizeCOASeatReservation(authorization) {
    return () => __awaiter(this, void 0, void 0, function* () {
        debug('calling deleteTmpReserve...');
        yield COA.services.reserve.delTmpReserve({
            theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
            date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
            title_code: authorization.object.updTmpReserveSeatArgs.title_code,
            title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
            time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
            tmp_reserve_num: authorization.result.tmp_reserve_num
        });
    });
}
exports.unauthorizeCOASeatReservation = unauthorizeCOASeatReservation;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ICOASeatReservationAuthorization} authorization
 * @memberof service/stock
 */
function transferCOASeatReservation(authorization) {
    // tslint:disable-next-line:max-func-body-length
    return (ownershipInfoAdapter, personAdapter) => __awaiter(this, void 0, void 0, function* () {
        const recipientDoc = yield personAdapter.personModel.findById(authorization.recipient.id).exec();
        if (recipientDoc === null) {
            throw new argument_1.default('authorization.recipient', 'recipient not found');
        }
        const recipient = recipientDoc.toObject();
        debug('recipient:', recipient);
        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = yield COA.services.reserve.stateReserve({
            theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
            reserve_num: authorization.result.tmp_reserve_num,
            tel_num: recipient.telephone
        });
        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = yield COA.services.reserve.updReserve({
                theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
                date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
                title_code: authorization.object.updTmpReserveSeatArgs.title_code,
                title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
                time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
                tmp_reserve_num: authorization.result.tmp_reserve_num,
                reserve_name: `${recipient.familyName}　${recipient.givenName}`,
                reserve_name_jkana: `${recipient.familyName}　${recipient.givenName}`,
                tel_num: recipient.telephone,
                mail_addr: recipient.email,
                reserve_amount: authorization.object.acceptedOffer.reduce((a, b) => a + b.price, 0),
                list_ticket: authorization.object.acceptedOffer.map((offer) => offer.itemOffered.reservedTicket.coaTicketInfo)
            });
        }
        // 資産永続化(リトライできるように)
        const ownershipInfos = authorization.object.acceptedOffer.map((offer) => {
            const reservation = offer.itemOffered;
            reservation.reservationStatus = reservationStatusType_1.default.ReservationConfirmed;
            reservation.underName.name = `${recipient.familyName} ${recipient.givenName}`;
            reservation.reservedTicket.underName.name = `${recipient.familyName} ${recipient.givenName}`;
            return OwnershipInfoFactory.create({
                acquiredFrom: authorization.agent,
                ownedFrom: moment().toDate(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: reservation
            });
        });
        yield Promise.all(ownershipInfos.map((ownershipInfo) => __awaiter(this, void 0, void 0, function* () {
            // 所有権永続化
            yield ownershipInfoAdapter.ownershipInfoModel.findOneAndUpdate({
                identifier: ownershipInfo.identifier
            }, ownershipInfo, { upsert: true }).exec();
        })));
    });
}
exports.transferCOASeatReservation = transferCOASeatReservation;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberof service/stock
 */
function disableTransactionInquiry(buyAction) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        if (_.isEmpty(buyAction.object.orderInquiryKey)) {
            throw new argument_1.default('transaction.inquiryKey', 'inquiryKey not created.');
        }
        const inquiryKey = buyAction.object.orderInquiryKey;
        // COAから内容抽出
        const reservation = yield COA.services.reserve.stateReserve({
            theater_code: inquiryKey.theaterCode,
            reserve_num: inquiryKey.orderNumber,
            tel_num: inquiryKey.telephone
        });
        if (reservation !== null) {
            // COA購入チケット取消
            debug('calling deleteReserve...');
            yield COA.services.reserve.delReserve({
                theater_code: inquiryKey.theaterCode,
                reserve_num: inquiryKey.orderNumber,
                tel_num: inquiryKey.telephone,
                date_jouei: reservation.date_jouei,
                title_code: reservation.title_code,
                title_branch_num: reservation.title_branch_num,
                time_begin: reservation.time_begin,
                list_seat: reservation.list_ticket
            });
        }
        // 永続化
        debug('updating transaction...');
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: buyAction.id
        }, { $unset: { 'object.orderInquiryKey': '' } } // 照会キーフィールドを削除する
        ).exec();
    });
}
exports.disableTransactionInquiry = disableTransactionInquiry;
