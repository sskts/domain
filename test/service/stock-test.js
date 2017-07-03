"use strict";
/**
 * 在庫サービステスト
 *
 * @ignore
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
const assert = require("assert");
const mongoose = require("mongoose");
const argument_1 = require("../../lib/error/argument");
const asset_1 = require("../../lib/adapter/asset");
const film_1 = require("../../lib/adapter/film");
const owner_1 = require("../../lib/adapter/owner");
const performance_1 = require("../../lib/adapter/performance");
const screen_1 = require("../../lib/adapter/screen");
const theater_1 = require("../../lib/adapter/theater");
const transaction_1 = require("../../lib/adapter/transaction");
const assetGroup_1 = require("../../lib/factory/assetGroup");
const GMOAuthorizationFactory = require("../../lib/factory/authorization/gmo");
const authorizationGroup_1 = require("../../lib/factory/authorizationGroup");
const objectId_1 = require("../../lib/factory/objectId");
const AnonymousOwnerFactory = require("../../lib/factory/owner/anonymous");
const TransactionFactory = require("../../lib/factory/transaction");
const AuthorizeTransactionEventFactory = require("../../lib/factory/transactionEvent/authorize");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
const MasterService = require("../../lib/service/master");
const StockService = require("../../lib/service/stock");
let TEST_ANOYMOUS_OWNER;
let TEST_COA_SEAT_RESERVATION_AUTHORIZATION;
let TEST_GMO_AUTHORIZATION;
let connection;
// tslint:disable-next-line:max-func-body-length
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // テスト用のパフォーマンス情報を取得
    const theaterAdapter = new theater_1.default(connection);
    const screenAdapter = new screen_1.default(connection);
    const filmAdapter = new film_1.default(connection);
    const performanceAdapter = new performance_1.default(connection);
    yield MasterService.importTheater('118')(theaterAdapter);
    yield MasterService.importScreens('118')(theaterAdapter, screenAdapter);
    yield MasterService.importFilms('118')(theaterAdapter, filmAdapter);
    yield MasterService.importPerformances('118', '20170401', '20170401')(filmAdapter, screenAdapter, performanceAdapter);
    const perforamnce = yield performanceAdapter.model.findOne().exec();
    TEST_ANOYMOUS_OWNER = AnonymousOwnerFactory.create({
        id: '58e344ac36a44424c0997dad',
        name_first: 'てすと',
        name_last: 'てすと',
        email: 'test@example.com',
        tel: '09012345678'
    });
    TEST_COA_SEAT_RESERVATION_AUTHORIZATION = {
        assets: [
            {
                mvtk_num: '',
                mvtk_kbn_denshiken: '00',
                mvtk_kbn_maeuriken: '00',
                mvtk_kbn_kensyu: '00',
                mvtk_sales_price: 0,
                kbn_eisyahousiki: '00',
                add_glasses: 0,
                mvtk_app_price: 0,
                sale_price: 2800,
                dis_price: 0,
                add_price: 1000,
                std_price: 1800,
                ticket_name_kana: 'トウジツイッパン',
                ticket_name: {
                    en: 'General Price',
                    ja: '当日一般'
                },
                ticket_code: '10',
                seat_code: 'Ａ－３',
                screen_section: '   ',
                performance: perforamnce.get('_id'),
                authorizations: [],
                price: 2800,
                group: assetGroup_1.default.SEAT_RESERVATION,
                ownership: {
                    authentication_records: [],
                    owner: '58e344ac36a44424c0997dad',
                    id: '58e344b236a44424c0997dae'
                },
                id: '58e344b236a44424c0997daf'
            },
            {
                mvtk_num: '',
                mvtk_kbn_denshiken: '00',
                mvtk_kbn_maeuriken: '00',
                mvtk_kbn_kensyu: '00',
                mvtk_sales_price: 0,
                kbn_eisyahousiki: '00',
                add_glasses: 0,
                mvtk_app_price: 0,
                sale_price: 2800,
                dis_price: 0,
                add_price: 1000,
                std_price: 1800,
                ticket_name_kana: 'トウジツイッパン',
                ticket_name: {
                    en: 'General Price',
                    ja: '当日一般'
                },
                ticket_code: '10',
                seat_code: 'Ａ－４',
                screen_section: '   ',
                performance: perforamnce.get('_id'),
                authorizations: [],
                price: 2800,
                group: assetGroup_1.default.SEAT_RESERVATION,
                ownership: {
                    authentication_records: [],
                    owner: '58e344ac36a44424c0997dad',
                    id: '58e344b236a44424c0997db0'
                },
                id: '58e344b236a44424c0997db1'
            }
        ],
        owner_to: TEST_ANOYMOUS_OWNER.id,
        owner_from: '5868e16789cc75249cdbfa4b',
        price: 5600,
        coa_screen_code: '60',
        coa_time_begin: '0950',
        coa_title_branch_num: '0',
        coa_title_code: '17165',
        coa_date_jouei: '20170404',
        coa_theater_code: '118',
        coa_tmp_reserve_num: 1103,
        group: authorizationGroup_1.default.COA_SEAT_RESERVATION,
        id: '58e344b236a44424c0997db2'
    };
    TEST_GMO_AUTHORIZATION = GMOAuthorizationFactory.create({
        price: 123,
        owner_to: TEST_ANOYMOUS_OWNER.id,
        owner_from: '5868e16789cc75249cdbfa4b',
        gmo_shop_id: 'xxx',
        gmo_shop_pass: 'xxx',
        gmo_order_id: 'xxx',
        gmo_amount: 123,
        gmo_access_id: 'xxx',
        gmo_access_pass: 'xxx',
        gmo_job_cd: 'xxx',
        gmo_pay_type: 'xxx'
    });
}));
describe('在庫サービス 取引照会無効化', () => {
    it('照会キーがなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const disableTransactionInquiryError = yield StockService.disableTransactionInquiry(transaction)(transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(disableTransactionInquiryError instanceof argument_1.default);
        assert.equal(disableTransactionInquiryError.argumentName, 'transaction.inquiry_key');
    }));
});
describe('在庫サービス 座席予約資産移動', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const ownerDoc = yield ownerAdapter.model.findByIdAndUpdate(TEST_ANOYMOUS_OWNER.id, TEST_ANOYMOUS_OWNER, { new: true, upsert: true }).exec();
        yield StockService.transferCOASeatReservation(TEST_COA_SEAT_RESERVATION_AUTHORIZATION)(assetAdapter, ownerAdapter, performanceAdapter);
        // 資産の存在を確認
        const asset1Doc = yield assetAdapter.model.findById('58e344b236a44424c0997daf').exec();
        assert.notEqual(asset1Doc, null);
        assert.equal(asset1Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset1Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset1Doc.get('seat_code'), 'Ａ－３');
        assert.equal(asset1Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        const asset2Doc = yield assetAdapter.model.findById('58e344b236a44424c0997db1').exec();
        assert.notEqual(asset2Doc, null);
        assert.equal(asset2Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset2Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset2Doc.get('seat_code'), 'Ａ－４');
        assert.equal(asset2Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        // テストデータ削除
        yield ownerDoc.remove();
    }));
    it('所有者が存在しないので座席予約資産移動失敗', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const authorization = Object.assign({}, TEST_COA_SEAT_RESERVATION_AUTHORIZATION, { owner_to: objectId_1.default().toString() });
        const transferError = yield StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter)
            .catch((error) => {
            return error;
        });
        assert(transferError instanceof argument_1.default);
        assert.equal(transferError.argumentName, 'authorization.owner_to');
    }));
    it('所有者が一般所有者ではないので座席予約資産移動失敗', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        // テストデータ作成
        const ownerDoc = yield ownerAdapter.model.create({ group: 'xxx' });
        const authorization = Object.assign({}, TEST_COA_SEAT_RESERVATION_AUTHORIZATION, { owner_to: ownerDoc.get('id') });
        const transferError = yield StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter)
            .catch((error) => {
            return error;
        });
        assert(transferError instanceof Error);
        // テストデータ削除
        yield ownerDoc.remove();
    }));
});
describe('在庫サービス 取引IDから座席予約資産移動', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            })
        });
        const event = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: TEST_COA_SEAT_RESERVATION_AUTHORIZATION
        });
        // tslint:disable-next-line:max-line-length
        const ownerDoc = yield ownerAdapter.model.findByIdAndUpdate(TEST_ANOYMOUS_OWNER.id, TEST_ANOYMOUS_OWNER, { new: true, upsert: true }).exec();
        const transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        yield transactionAdapter.addEvent(event);
        yield StockService.transferCOASeatReservationByTransactionId(transaction.id)(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter);
        // 資産の存在を確認
        const asset1Doc = yield assetAdapter.model.findById('58e344b236a44424c0997daf').exec();
        assert.notEqual(asset1Doc, null);
        assert.equal(asset1Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset1Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset1Doc.get('seat_code'), 'Ａ－３');
        assert.equal(asset1Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        const asset2Doc = yield assetAdapter.model.findById('58e344b236a44424c0997db1').exec();
        assert.notEqual(asset2Doc, null);
        assert.equal(asset2Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset2Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset2Doc.get('seat_code'), 'Ａ－４');
        assert.equal(asset2Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionDoc.remove();
        yield ownerDoc.remove();
    }));
    it('取引が存在しなければArgumentError', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // 存在しない取引なのでエラーになるはず
        const transferError = yield StockService.transferCOASeatReservationByTransactionId(objectId_1.default().toString())(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(transferError instanceof argument_1.default);
        assert.equal(transferError.argumentName, 'transactionId');
    }));
    it('成立取引でなければArgumentError', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // 進行中取引をテストデータとして用意する
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        const transferError = yield StockService.transferCOASeatReservationByTransactionId(transaction.id)(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(transferError instanceof argument_1.default);
        assert.equal(transferError.argumentName, 'transactionId');
        // テストデータ削除
        yield transactionDoc.remove();
    }));
    it('承認がなければArgumentError', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // 承認のない成立取引をテストデータとして用意する
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        const transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        const transferError = yield StockService.transferCOASeatReservationByTransactionId(transaction.id)(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(transferError instanceof argument_1.default);
        assert.equal(transferError.argumentName, 'transactionId');
        // テストデータ削除
        yield transactionDoc.remove();
    }));
    it('座席予約承認がなければArgumentError', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        const ownerAdapter = new owner_1.default(connection);
        const performanceAdapter = new performance_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // GMO承認だけ追加された成立取引をテストデータとして用意する
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        const event = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: TEST_GMO_AUTHORIZATION
        });
        const transactionDoc = yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        yield transactionAdapter.addEvent(event);
        const transferError = yield StockService.transferCOASeatReservationByTransactionId(transaction.id)(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(transferError instanceof argument_1.default);
        assert.equal(transferError.argumentName, 'transactionId');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionDoc.remove();
    }));
});
