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
const _ = require("underscore");
const argument_1 = require("../error/argument");
const SeatReservationAssetFactory = require("../factory/asset/seatReservation");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const ownerGroup_1 = require("../factory/ownerGroup");
const OwnershipFactory = require("../factory/ownership");
const TransactionInquiryKeyFactory = require("../factory/transactionInquiryKey");
const transactionStatus_1 = require("../factory/transactionStatus");
const debug = createDebug('sskts-domain:service:stock');
/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization.ICOASeatReservationAuthorization} authorization
 *
 * @memberof service/stock
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
 * @memberof service/stock
 */
function transferCOASeatReservation(authorization) {
    // tslint:disable-next-line:max-func-body-length
    return (assetAdapter, ownerAdapter, performanceAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 所有者情報を取得
        const ownerDoc = yield ownerAdapter.model.findById(authorization.owner_to).exec();
        if (ownerDoc === null) {
            throw new argument_1.default('authorization.owner_to', 'owner not found');
        }
        // 一般以外は現時点で未対応
        // todo implemented error
        if (ownerDoc.get('group') !== ownerGroup_1.default.ANONYMOUS) {
            throw new Error('owner group not implemented');
        }
        const owner = ownerDoc.toObject();
        debug('owner:', owner);
        // パフォーマンス情報詳細を取得
        const performanceDoc = yield performanceAdapter.model.findById(authorization.assets[0].performance)
            .populate('theater')
            .populate('screen')
            .populate('film')
            .exec();
        if (performanceDoc === null) {
            throw new argument_1.default('authorization.assets[0].performance', 'performance not found');
        }
        const performance = performanceDoc.toObject();
        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = yield COA.ReserveService.stateReserve({
            theater_code: authorization.coa_theater_code,
            reserve_num: authorization.coa_tmp_reserve_num,
            tel_num: owner.tel
        });
        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = yield COA.ReserveService.updReserve({
                theater_code: authorization.coa_theater_code,
                date_jouei: authorization.coa_date_jouei,
                title_code: authorization.coa_title_code,
                title_branch_num: authorization.coa_title_branch_num,
                time_begin: authorization.coa_time_begin,
                tmp_reserve_num: authorization.coa_tmp_reserve_num,
                reserve_name: `${owner.name_last}　${owner.name_first}`,
                reserve_name_jkana: `${owner.name_last}　${owner.name_first}`,
                tel_num: owner.tel,
                mail_addr: owner.email,
                reserve_amount: authorization.assets.reduce((a, b) => a + b.sale_price, 0),
                list_ticket: authorization.assets.map((asset) => {
                    return {
                        ticket_code: asset.ticket_code,
                        std_price: asset.std_price,
                        add_price: asset.add_price,
                        dis_price: 0,
                        sale_price: (asset.std_price + asset.add_price),
                        ticket_count: 1,
                        mvtk_app_price: asset.mvtk_app_price,
                        seat_num: asset.seat_code,
                        add_glasses: asset.add_glasses,
                        kbn_eisyahousiki: asset.kbn_eisyahousiki,
                        mvtk_num: asset.mvtk_num,
                        mvtk_kbn_denshiken: asset.mvtk_kbn_denshiken,
                        mvtk_kbn_maeuriken: asset.mvtk_kbn_maeuriken,
                        mvtk_kbn_kensyu: asset.mvtk_kbn_kensyu,
                        mvtk_sales_price: asset.mvtk_sales_price
                    };
                })
            });
        }
        // 資産永続化(リトライできるように)
        yield Promise.all(authorization.assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
            // 座席予約資産に詳細情報を追加
            // 本来この時点でownershop.idは決定しているはずだが、COAとの連携の場合本予約で初めてQR文字列を取得できるので、ここで置き換える
            // 具体的には、本予約結果もしくは購入チケット内容抽出結果から該当座席コードのQR文字列を取り出す
            // let qr: string;
            const qr = (stateReserveResult !== null)
                ? stateReserveResult.list_ticket.find((stateReserveTicket) => (stateReserveTicket.seat_num === asset.seat_code)).seat_qrcode
                : updReserveResult.list_qr.find((updReserveQR) => (updReserveQR.seat_num === asset.seat_code)).seat_qrcode;
            const args = Object.assign({}, asset, {
                ownership: OwnershipFactory.create({
                    id: qr,
                    owner: owner.id
                }),
                performance_day: performance.day,
                performance_time_start: performance.time_start,
                performance_time_end: performance.time_end,
                theater: performance.theater.id,
                theater_name: performance.theater.name,
                theater_name_kana: performance.theater.name_kana,
                theater_address: performance.theater.address,
                screen: performance.screen.id,
                screen_name: performance.screen.name,
                film: performance.film.id,
                film_name: performance.film.name,
                film_name_kana: performance.film.name_kana,
                film_name_short: performance.film.name_short,
                film_name_original: performance.film.name_original,
                film_minutes: performance.film.minutes,
                film_kbn_eirin: performance.film.kbn_eirin,
                film_kbn_eizou: performance.film.kbn_eizou,
                film_kbn_joueihousiki: performance.film.kbn_joueihousiki,
                film_kbn_jimakufukikae: performance.film.kbn_jimakufukikae,
                film_copyright: performance.film.copyright,
                transaction_inquiry_key: TransactionInquiryKeyFactory.create({
                    theater_code: performance.theater.id,
                    reserve_num: authorization.coa_tmp_reserve_num,
                    tel: owner.tel
                })
            });
            const seatReservationAsset = SeatReservationAssetFactory.create(args);
            // 資産永続化
            debug('storing asset...', asset);
            yield assetAdapter.model.findByIdAndUpdate(seatReservationAsset.id, seatReservationAsset, { new: true, upsert: true }).exec();
            debug('asset stored.');
        })));
    });
}
exports.transferCOASeatReservation = transferCOASeatReservation;
/**
 * 取引IDからCOA座席予約資産移動を実行する
 *
 * @param transactionId 取引ID
 * @return {AssetAndOwnerAndPerformanceAndTransactionOperation<void>}
 */
function transferCOASeatReservationByTransactionId(transactionId) {
    // tslint:disable-next-line:max-line-length
    return (assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 取引検索
        const transactionDoc = yield transactionAdapter.transactionModel.findById(transactionId, 'status').exec();
        if (transactionDoc === null) {
            throw new argument_1.default('transactionId', 'transaction not found');
        }
        if (transactionDoc.get('status') !== transactionStatus_1.default.CLOSED) {
            throw new argument_1.default('transactionId', 'transaction not closed');
        }
        // 取引の承認を取得
        const authorizations = yield transactionAdapter.findAuthorizationsById(transactionId);
        debug('authorizations:', authorizations);
        if (authorizations.length === 0) {
            throw new argument_1.default('transactionId', 'transaction has no authorizations');
        }
        // COA座席予約承認を取り出す
        const coaSeatReservationAuthorization = authorizations.find((authorization) => authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION);
        if (coaSeatReservationAuthorization === undefined) {
            throw new argument_1.default('transactionId', 'transaction has no coaSeatReservationAuthorization');
        }
        // tslint:disable-next-line:max-line-length
        yield transferCOASeatReservation(coaSeatReservationAuthorization)(assetAdapter, ownerAdapter, performanceAdapter);
    });
}
exports.transferCOASeatReservationByTransactionId = transferCOASeatReservationByTransactionId;
/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberof service/stock
 */
function disableTransactionInquiry(transaction) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        if (_.isEmpty(transaction.inquiry_key)) {
            throw new argument_1.default('transaction.inquiry_key', 'inquiry_key not created.');
        }
        const inquiryKey = transaction.inquiry_key;
        // COAから内容抽出
        const reservation = yield COA.ReserveService.stateReserve({
            theater_code: inquiryKey.theater_code,
            reserve_num: inquiryKey.reserve_num,
            tel_num: inquiryKey.tel
        });
        if (reservation !== null) {
            // COA購入チケット取消
            debug('calling deleteReserve...');
            yield COA.ReserveService.delReserve({
                theater_code: inquiryKey.theater_code,
                reserve_num: inquiryKey.reserve_num,
                tel_num: inquiryKey.tel,
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
            _id: transaction.id
        }, { $unset: { inquiry_key: '' } } // 照会キーフィールドを削除する
        ).exec();
    });
}
exports.disableTransactionInquiry = disableTransactionInquiry;
