/**
 * 在庫サービス
 *
 * @namespace StockService
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const createDebug = require("debug");
const objectId_1 = require("../model/objectId");
const transactionStatus_1 = require("../model/transactionStatus");
const debug = createDebug('sskts-domain:service:stock');
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {COAOperation<void>}
 *
 * @memberOf StockServiceInterpreter
 */
function unauthorizeCOASeatReservation(authorization) {
    return (coaRepository) => __awaiter(this, void 0, void 0, function* () {
        debug('calling deleteTmpReserve...');
        yield coaRepository.deleteTmpReserveInterface.call({
            theater_code: authorization.coa_theater_code,
            date_jouei: authorization.coa_date_jouei,
            title_code: authorization.coa_title_code,
            title_branch_num: authorization.coa_title_branch_num,
            time_begin: authorization.coa_time_begin,
            tmp_reserve_num: authorization.coa_tmp_reserve_num
        });
    });
}
exports.unauthorizeCOASeatReservation = unauthorizeCOASeatReservation;
/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberOf StockServiceInterpreter
 */
function transferCOASeatReservation(authorization) {
    return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
        // ウェブフロントで事前に本予約済みなので不要
        // await COA.updateReserveInterface.call({
        // });
        const promises = authorization.assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
            // 資産永続化
            debug('storing asset...', asset);
            yield assetRepository.store(asset);
            debug('asset stored.');
        }));
        yield Promise.all(promises);
    });
}
exports.transferCOASeatReservation = transferCOASeatReservation;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockServiceInterpreter
 */
function disableTransactionInquiry(args) {
    return (transactionRepository, coaRepository) => __awaiter(this, void 0, void 0, function* () {
        // 取引取得
        const option = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
        if (option.isEmpty) {
            throw new Error('transaction not found.');
        }
        const tranasction = option.get();
        if (!tranasction.inquiry_key) {
            throw new Error('inquiry_key not created.');
        }
        // COAから内容抽出
        const reservation = yield coaRepository.stateReserveInterface.call({
            theater_code: tranasction.inquiry_key.theater_code,
            reserve_num: tranasction.inquiry_key.reserve_num,
            tel_num: tranasction.inquiry_key.tel
        });
        // COA購入チケット取消
        debug('calling deleteReserve...');
        yield coaRepository.deleteReserveInterface.call({
            theater_code: tranasction.inquiry_key.theater_code,
            reserve_num: tranasction.inquiry_key.reserve_num,
            tel_num: tranasction.inquiry_key.tel,
            date_jouei: reservation.date_jouei,
            title_code: reservation.title_code,
            title_branch_num: reservation.title_branch_num,
            time_begin: reservation.time_begin,
            list_seat: reservation.list_ticket
        });
        // 永続化
        const update = {
            $set: {
                inquiry_key: null
            }
        };
        debug('updating transaction...', update);
        yield transactionRepository.findOneAndUpdate({
            _id: objectId_1.default(args.transaction_id),
            status: transactionStatus_1.default.UNDERWAY
        }, update);
    });
}
exports.disableTransactionInquiry = disableTransactionInquiry;
