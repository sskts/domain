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
 * 在庫サービステスト
 *
 * @ignore
 */
const assert = require("assert");
const mongoose = require("mongoose");
const argument_1 = require("../../lib/error/argument");
const asset_1 = require("../../lib/adapter/asset");
const owner_1 = require("../../lib/adapter/owner");
const transaction_1 = require("../../lib/adapter/transaction");
const assetGroup_1 = require("../../lib/factory/assetGroup");
const CoaSeatReservationAuthorizationFactory = require("../../lib/factory/authorization/coaSeatReservation");
const authorizationGroup_1 = require("../../lib/factory/authorizationGroup");
const objectId_1 = require("../../lib/factory/objectId");
const TransactionFactory = require("../../lib/factory/transaction");
const StockService = require("../../lib/service/stock");
let connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});
describe('在庫サービス', () => {
    it('照会キーがないので取引照会無効化失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        const transaction = TransactionFactory.create({
            status: 'UNDERWAY',
            owners: [],
            expires_at: new Date()
        });
        let disableTransactionInquiryError;
        try {
            yield StockService.disableTransactionInquiry(transaction)(transactionAdapter);
        }
        catch (error) {
            disableTransactionInquiryError = error;
        }
        assert(disableTransactionInquiryError instanceof Error);
    }));
    it('COAで本予約できないので座席予約資産移動失敗', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const authorization = {
            id: '58e1e6d268ae4a2fc8f4e4c0',
            group: authorizationGroup_1.default.COA_SEAT_RESERVATION,
            coa_tmp_reserve_num: 995,
            coa_theater_code: '118',
            coa_date_jouei: '20170403',
            coa_title_code: '16344',
            coa_title_branch_num: '0',
            coa_time_begin: '1000',
            coa_screen_code: '30',
            price: 4000,
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: '58e1e6cc68ae4a2fc8f4e4bb',
            assets: [
                {
                    id: '58e1e6d268ae4a2fc8f4e4bd',
                    ownership: {
                        id: '58e1e6d268ae4a2fc8f4e4bc',
                        owner: '58e1e6cc68ae4a2fc8f4e4bb',
                        authenticated: false
                    },
                    group: assetGroup_1.default.SEAT_RESERVATION,
                    price: 2000,
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: '   ',
                    seat_code: 'Ｂ－４',
                    ticket_code: '10',
                    ticket_name_ja: '当日一般',
                    ticket_name_en: 'General Price',
                    ticket_name_kana: 'トウジツイッパン',
                    std_price: 1800,
                    add_price: 200,
                    dis_price: 0,
                    sale_price: 2000,
                    mvtk_app_price: 0,
                    add_glasses: 0
                },
                {
                    id: '58e1e6d268ae4a2fc8f4e4bf',
                    ownership: {
                        id: '58e1e6d268ae4a2fc8f4e4be',
                        owner: '58e1e6cc68ae4a2fc8f4e4bb',
                        authenticated: false
                    },
                    group: assetGroup_1.default.SEAT_RESERVATION,
                    price: 2000,
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: '   ',
                    seat_code: 'Ｂ－５',
                    ticket_code: '10',
                    ticket_name_ja: '当日一般',
                    ticket_name_en: 'General Price',
                    ticket_name_kana: 'トウジツイッパン',
                    std_price: 1800,
                    add_price: 200,
                    dis_price: 0,
                    sale_price: 2000,
                    mvtk_app_price: 0,
                    add_glasses: 0
                }
            ]
        };
        try {
            yield StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);
        }
        catch (error) {
            assert(error instanceof Error);
            assert.equal(error.message, '本予約失敗');
            return;
        }
        throw new Error('should not be passed');
    }));
    it('所有者が存在しないので座席予約資産移動失敗', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const authorization = CoaSeatReservationAuthorizationFactory.create({
            price: 4000,
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: objectId_1.default().toString(),
            coa_tmp_reserve_num: 995,
            coa_theater_code: '118',
            coa_date_jouei: '20170403',
            coa_title_code: '16344',
            coa_title_branch_num: '0',
            coa_time_begin: '1000',
            coa_screen_code: '30',
            assets: []
        });
        try {
            yield StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);
        }
        catch (error) {
            assert(error instanceof argument_1.default);
            assert.equal(error.argumentName, 'authorization.owner_to');
            return;
        }
        throw new Error('should not be passed');
    }));
    it('所有者が一般所有者ではないので座席予約資産移動失敗', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        // テストデータ作成
        const ownerDoc = yield ownerAdapter.model.create({ group: 'xxx' });
        const authorization = CoaSeatReservationAuthorizationFactory.create({
            price: 4000,
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: ownerDoc.get('id'),
            coa_tmp_reserve_num: 995,
            coa_theater_code: '118',
            coa_date_jouei: '20170403',
            coa_title_code: '16344',
            coa_title_branch_num: '0',
            coa_time_begin: '1000',
            coa_screen_code: '30',
            assets: []
        });
        let transferCOASeatReservationError;
        try {
            yield StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);
        }
        catch (error) {
            transferCOASeatReservationError = error;
        }
        // テストデータ削除
        ownerDoc.remove();
        assert(transferCOASeatReservationError instanceof Error);
    }));
});
