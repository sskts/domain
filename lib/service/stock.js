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
function unauthorizeSeatReservation(transaction) {
    return () => __awaiter(this, void 0, void 0, function* () {
        if (transaction.object.seatReservation !== undefined) {
            debug('calling deleteTmpReserve...');
            const authorization = transaction.object.seatReservation;
            yield COA.services.reserve.delTmpReserve({
                theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
                date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
                title_code: authorization.object.updTmpReserveSeatArgs.title_code,
                title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
                time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
                tmp_reserve_num: authorization.result.tmp_reserve_num
            });
        }
    });
}
exports.unauthorizeSeatReservation = unauthorizeSeatReservation;
/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorization
 * @memberof service/stock
 */
function transferSeatReservation(transaction) {
    // tslint:disable-next-line:max-func-body-length
    return (ownershipInfoAdapter, personAdapter) => __awaiter(this, void 0, void 0, function* () {
        if (transaction.object.seatReservation !== undefined) {
            const authorization = transaction.object.seatReservation;
            const recipientDoc = yield personAdapter.personModel.findById(transaction.agent.id).exec();
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
            if (transaction.result !== undefined) {
                yield Promise.all(transaction.result.ownershipInfos.map((ownershipInfo) => __awaiter(this, void 0, void 0, function* () {
                    // 所有権永続化
                    yield ownershipInfoAdapter.ownershipInfoModel.findOneAndUpdate({
                        identifier: ownershipInfo.identifier
                    }, ownershipInfo, { upsert: true }).exec();
                })));
            }
        }
    });
}
exports.transferSeatReservation = transferSeatReservation;
