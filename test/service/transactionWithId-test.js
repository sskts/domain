"use strict";
/**
 * 取引(ID指定)サービステスト
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
const TransactionWithIdService = require("../../lib/service/transactionWithId");
const owner_1 = require("../../lib/adapter/owner");
const transaction_1 = require("../../lib/adapter/transaction");
const assetGroup_1 = require("../../lib/factory/assetGroup");
const COASeatReservationAuthorizationFactory = require("../../lib/factory/authorization/coaSeatReservation");
const GMOAuthorizationFactory = require("../../lib/factory/authorization/gmo");
const MvtkAuthorizationFactory = require("../../lib/factory/authorization/mvtk");
const objectId_1 = require("../../lib/factory/objectId");
const AnonymousOwnerFactory = require("../../lib/factory/owner/anonymous");
const OwnershipFactory = require("../../lib/factory/ownership");
const TransactionFactory = require("../../lib/factory/transaction");
const AuthorizeTransactionEventFactory = require("../../lib/factory/transactionEvent/authorize");
const transactionEventGroup_1 = require("../../lib/factory/transactionEventGroup");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
const argument_1 = require("../../lib/error/argument");
let TEST_COA_SEAT_RESERVATION_AUTHORIZATION;
let TEST_GMO_AUTHORIZATION;
let TEST_MVTK_AUTHORIZATION;
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const transactionAdapter = new transaction_1.default(connection);
    yield transactionAdapter.transactionModel.remove({}).exec();
    yield transactionAdapter.transactionEventModel.remove({}).exec();
    TEST_GMO_AUTHORIZATION = GMOAuthorizationFactory.create({
        price: 123,
        owner_from: 'xxx',
        owner_to: 'xxx',
        gmo_shop_id: 'xxx',
        gmo_shop_pass: 'xxx',
        gmo_order_id: 'xxx',
        gmo_amount: 123,
        gmo_access_id: 'xxx',
        gmo_access_pass: 'xxx',
        gmo_job_cd: 'xxx',
        gmo_pay_type: 'xxx'
    });
    TEST_COA_SEAT_RESERVATION_AUTHORIZATION = COASeatReservationAuthorizationFactory.create({
        price: 123,
        owner_from: 'xxx',
        owner_to: 'xxx',
        coa_tmp_reserve_num: 123,
        coa_theater_code: 'xxx',
        coa_date_jouei: 'xxx',
        coa_title_code: 'xxx',
        coa_title_branch_num: 'xxx',
        coa_time_begin: 'xxx',
        coa_screen_code: 'xxx',
        assets: [
            {
                id: 'xxx',
                group: assetGroup_1.default.SEAT_RESERVATION,
                price: 123,
                authorizations: [],
                ownership: OwnershipFactory.create({
                    owner: 'xxx'
                }),
                performance: 'xxx',
                screen_section: 'xxx',
                seat_code: 'xxx',
                ticket_code: 'xxx',
                ticket_name: {
                    en: 'xxx',
                    ja: 'xxx'
                },
                ticket_name_kana: 'xxx',
                std_price: 123,
                add_price: 123,
                dis_price: 123,
                sale_price: 123,
                mvtk_app_price: 0,
                add_glasses: 0,
                kbn_eisyahousiki: '00',
                mvtk_num: '',
                mvtk_kbn_denshiken: '00',
                mvtk_kbn_maeuriken: '00',
                mvtk_kbn_kensyu: '00',
                mvtk_sales_price: 0
            }
        ]
    });
    TEST_MVTK_AUTHORIZATION = MvtkAuthorizationFactory.create({
        price: 1234,
        owner_from: 'xxx',
        owner_to: 'xxx',
        kgygish_cd: '000000',
        yyk_dvc_typ: '00',
        trksh_flg: '0',
        kgygish_sstm_zskyyk_no: 'xxx',
        kgygish_usr_zskyyk_no: 'xxx',
        jei_dt: '2012/02/01 25:45:00',
        kij_ymd: '2012/02/01',
        st_cd: '0000000000',
        scren_cd: '0000000000',
        knyknr_no_info: [
            {
                knyknr_no: '0000000000',
                pin_cd: '0000',
                knsh_info: [
                    {
                        knsh_typ: '01',
                        mi_num: '1'
                    }
                ]
            }
        ],
        zsk_info: [
            {
                zsk_cd: 'Ａ－２'
            }
        ],
        skhn_cd: '0000000000'
    });
}));
describe('取引サービス IDで取得', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        yield transactionAdapter.transactionModel.remove({}).exec();
    }));
    it('存在しなければmonapt.None', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        const transactionOption = yield TransactionWithIdService.findById(objectId_1.default().toString())(transactionAdapter);
        assert(transactionOption.isEmpty);
    }));
    it('取引存在すればmonapt.Some', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        const transactionOption = yield TransactionWithIdService.findById(transaction.id)(transactionAdapter);
        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().id, transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('取引成立', () => {
    // todo テストコード
    it('照会可能になっていなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // 照会キーのないテストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        let closeError;
        try {
            yield TransactionWithIdService.close(transaction.id)(transactionAdapter);
        }
        catch (error) {
            closeError = error;
        }
        assert(closeError instanceof Error);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('GMO資産承認追加', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { new: true, upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { new: true, upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        yield TransactionWithIdService.addGMOAuthorization(transaction.id, authorization)(transactionAdapter);
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({ 'authorization.id': authorization.id }).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('COA資産承認追加', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const authorization = Object.assign({}, TEST_COA_SEAT_RESERVATION_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        yield TransactionWithIdService.addCOASeatReservationAuthorization(transaction.id, authorization)(transactionAdapter);
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({ 'authorization.id': authorization.id }).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('ムビチケ着券承認追加', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const authorization = Object.assign({}, TEST_MVTK_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        yield TransactionWithIdService.addMvtkAuthorization(transaction.id, authorization)(transactionAdapter);
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({ 'authorization.id': authorization.id }).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('承認追加', () => {
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const addAuthorizationError = yield TransactionWithIdService.addAuthorization(transaction.id, authorization)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(addAuthorizationError instanceof argument_1.default);
        assert.equal(addAuthorizationError.argumentName, 'transactionId');
    }));
    it('所有者fromが存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const addAuthorizationError = yield TransactionWithIdService.addAuthorization(transaction.id, authorization)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(addAuthorizationError instanceof argument_1.default);
        assert.equal(addAuthorizationError.argumentName, 'authorization.owner_from');
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('所有者toが存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const addAuthorizationError = yield TransactionWithIdService.addAuthorization(transaction.id, authorization)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(addAuthorizationError instanceof argument_1.default);
        assert.equal(addAuthorizationError.argumentName, 'authorization.owner_to');
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('承認削除', () => {
    it('削除できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const authorizeEvent = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield transactionAdapter.transactionEventModel.findByIdAndUpdate(authorizeEvent.id, authorizeEvent, { upsert: true }).exec();
        yield TransactionWithIdService.removeAuthorization(transaction.id, authorization.id)(transactionAdapter);
        // 承認削除取引イベントが作成されているはず
        const unauthorizeTransactionEventDocs = yield transactionAdapter.transactionEventModel.findOne({
            'authorization.id': authorization.id,
            group: transactionEventGroup_1.default.UNAUTHORIZE
        }).exec();
        assert(unauthorizeTransactionEventDocs !== null);
        assert(unauthorizeTransactionEventDocs.get('transaction'), transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const removeAuthorizationError = yield TransactionWithIdService.removeAuthorization(transaction.id, authorization.id)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(removeAuthorizationError instanceof argument_1.default);
        assert.equal(removeAuthorizationError.argumentName, 'transactionId');
    }));
    it('承認が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const removeAuthorizationError = yield TransactionWithIdService.removeAuthorization(transaction.id, authorization.id)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(removeAuthorizationError instanceof argument_1.default);
        assert.equal(removeAuthorizationError.argumentName, 'authorizationId');
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
