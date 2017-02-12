"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const objectId_1 = require("../../model/objectId");
const transactionStatus_1 = require("../../model/transactionStatus");
/**
 * 在庫サービス
 *
 * @class StockServiceInterpreter
 * @implements {StockService}
 */
class StockServiceInterpreter {
    /**
     * 資産承認解除(COA座席予約)
     *
     * @param {COASeatReservationAuthorization} authorization
     * @returns {COAOperation<void>}
     *
     * @memberOf StockServiceInterpreter
     */
    unauthorizeCOASeatReservation(authorization) {
        return (coaRepository) => __awaiter(this, void 0, void 0, function* () {
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
    /**
     * 資産移動(COA座席予約)
     *
     * @param {COASeatReservationAuthorization} authorization
     * @returns {AssetOperation<void>}
     *
     * @memberOf StockServiceInterpreter
     */
    transferCOASeatReservation(authorization) {
        return (assetRepository) => __awaiter(this, void 0, void 0, function* () {
            // ウェブフロントで事前に本予約済みなので不要
            // await COA.updateReserveInterface.call({
            // });
            const promises = authorization.assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
                // 資産永続化
                yield assetRepository.store(asset);
            }));
            yield Promise.all(promises);
        });
    }
    /**
     * 取引照会を無効にする
     * COAのゴミ購入データを削除する
     *
     * @memberOf StockServiceInterpreter
     */
    disableTransactionInquiry(args) {
        return (transactionRepository, coaRepository) => __awaiter(this, void 0, void 0, function* () {
            // 取引取得
            const option = yield transactionRepository.findById(objectId_1.default(args.transaction_id));
            if (option.isEmpty) {
                throw new Error("transaction not found.");
            }
            const tranasction = option.get();
            if (!tranasction.inquiry_key) {
                throw new Error("inquiry_key not created.");
            }
            // COAから内容抽出
            const reservation = yield coaRepository.stateReserveInterface.call({
                theater_code: tranasction.inquiry_key.theater_code,
                reserve_num: tranasction.inquiry_key.reserve_num,
                tel_num: tranasction.inquiry_key.tel
            });
            // COA購入チケット取消
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
            yield transactionRepository.findOneAndUpdate({
                _id: objectId_1.default(args.transaction_id),
                status: transactionStatus_1.default.UNDERWAY
            }, {
                $set: {
                    inquiry_key: null
                }
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StockServiceInterpreter;
