"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 在庫サービス
 *
 * @namespace StockService
 */
const COA = require("@motionpicture/coa-service");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:stock');
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization.ICOASeatReservationAuthorization} authorization
 *
 * @memberOf StockService
 */
function unauthorizeCOASeatReservation(authorization) {
    return () => __awaiter(this, void 0, void 0, function* () {
        debug('calling deleteTmpReserve...');
        yield COA.ReserveService.delTmpReserve({
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
 * @memberOf StockService
 */
function transferCOASeatReservation(authorization) {
    return (assetAdapter) => __awaiter(this, void 0, void 0, function* () {
        const promises = authorization.assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
            // 資産永続化
            debug('storing asset...', asset);
            yield assetAdapter.model.findByIdAndUpdate(asset.id, asset, { new: true, upsert: true }).exec();
            debug('asset stored.');
        }));
        yield Promise.all(promises);
        // 所有者情報を取得
        // await owner = assetAdapter.model.findById(authorization.assets[0].ownership.owner).exec();
        // COA本予約
        // let reserveAmount = 0;
        // authorization.assets.forEach((asset) => {
        //     reserveAmount += asset.sale_price;
        // });
        // await COA.ReserveService.updReserve({
        //     theater_code: authorization.coa_theater_code,
        //     date_jouei: authorization.coa_date_jouei,
        //     title_code: authorization.coa_title_code,
        //     title_branch_num: authorization.coa_title_branch_num,
        //     time_begin: authorization.coa_time_begin,
        //     tmp_reserve_num: authorization.coa_tmp_reserve_num,
        //     reserve_name: authorization.coa_date_jouei,
        //     reserve_name_jkana: authorization.coa_date_jouei,
        //     tel_num: authorization.coa_date_jouei,
        //     mail_addr: authorization.coa_date_jouei,
        //     reserve_amount: reserveAmount,
        //     list_ticket: authorization.assets.map((asset) => {
        //         return {
        //             ticket_code: asset.ticket_code,
        //             std_price: asset.std_price,
        //             add_price: asset.add_price,
        //             dis_price: 0,
        //             sale_price: (asset.std_price + asset.add_price),
        //             ticket_count: 1,
        //             mvtk_app_price: asset.mvtk_app_price,
        //             seat_num: asset.seat_code,
        //             add_glasses: asset.add_glasses
        //         };
        //     })
        // });
    });
}
exports.transferCOASeatReservation = transferCOASeatReservation;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockService
 */
function disableTransactionInquiry(transaction) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        if (transaction.inquiry_key === undefined) {
            throw new Error('inquiry_key not created.');
        }
        // COAから内容抽出
        const reservation = yield COA.ReserveService.stateReserve({
            theater_code: transaction.inquiry_key.theater_code,
            reserve_num: transaction.inquiry_key.reserve_num,
            tel_num: transaction.inquiry_key.tel
        });
        // COA購入チケット取消
        debug('calling deleteReserve...');
        yield COA.ReserveService.delReserve({
            theater_code: transaction.inquiry_key.theater_code,
            reserve_num: transaction.inquiry_key.reserve_num,
            tel_num: transaction.inquiry_key.tel,
            date_jouei: reservation.date_jouei,
            title_code: reservation.title_code,
            title_branch_num: reservation.title_branch_num,
            time_begin: reservation.time_begin,
            list_seat: reservation.list_ticket
        });
        // 永続化
        debug('updating transaction...');
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: transaction.id
        }, { $unset: { inquiry_key: '' } }).exec();
    });
}
exports.disableTransactionInquiry = disableTransactionInquiry;
