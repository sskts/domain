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
const bcrypt = require("bcryptjs");
const moment = require("moment");
const mongoose = require("mongoose");
const TransactionWithIdService = require("../../lib/service/transactionWithId");
const owner_1 = require("../../lib/adapter/owner");
const transaction_1 = require("../../lib/adapter/transaction");
const assetGroup_1 = require("../../lib/factory/assetGroup");
const COASeatReservationAuthorizationFactory = require("../../lib/factory/authorization/coaSeatReservation");
const GMOAuthorizationFactory = require("../../lib/factory/authorization/gmo");
const MvtkAuthorizationFactory = require("../../lib/factory/authorization/mvtk");
const cardGroup_1 = require("../../lib/factory/cardGroup");
const EmailNotificationFactory = require("../../lib/factory/notification/email");
const objectId_1 = require("../../lib/factory/objectId");
const AnonymousOwnerFactory = require("../../lib/factory/owner/anonymous");
const MemberOwnerFactory = require("../../lib/factory/owner/member");
const ownerGroup_1 = require("../../lib/factory/ownerGroup");
const OwnershipFactory = require("../../lib/factory/ownership");
const TransactionFactory = require("../../lib/factory/transaction");
const AddNotificationTransactionEventFactory = require("../../lib/factory/transactionEvent/addNotification");
const AuthorizeTransactionEventFactory = require("../../lib/factory/transactionEvent/authorize");
const transactionEventGroup_1 = require("../../lib/factory/transactionEventGroup");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
const argument_1 = require("../../lib/error/argument");
let TEST_COA_SEAT_RESERVATION_AUTHORIZATION;
let TEST_GMO_AUTHORIZATION;
let TEST_MVTK_AUTHORIZATION;
let TEST_EMAIL_NOTIFICATION;
let TEST_TRANSACTION_INQUIRY_KEY;
let TEST_PROMOTER_OWNER;
const TEST_GMO_CARD = {
    card_no: '4111111111111111',
    card_pass: '111',
    expire: '1812',
    holder_name: 'AA BB',
    group: cardGroup_1.default.GMO
};
let connection;
// tslint:disable-next-line:max-func-body-length
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const ownerAdapter = new owner_1.default(connection);
    const transactionAdapter = new transaction_1.default(connection);
    // 全て削除してからテスト開始
    yield ownerAdapter.model.remove({}).exec();
    yield transactionAdapter.transactionModel.remove({}).exec();
    yield transactionAdapter.transactionEventModel.remove({}).exec();
    // 興行所有者を準備
    const promoterOwnerDoc = yield ownerAdapter.model.findOneAndUpdate({ group: ownerGroup_1.default.PROMOTER }, {
        name: {
            ja: '佐々木興業株式会社',
            en: 'Cinema Sunshine Co., Ltd.'
        }
    }, { new: true, upsert: true }).exec();
    TEST_PROMOTER_OWNER = promoterOwnerDoc.toObject();
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
    TEST_EMAIL_NOTIFICATION = EmailNotificationFactory.create({
        from: 'noreply@example.com',
        to: 'noreply@example.com',
        subject: 'xxx',
        content: 'xxx'
    });
    TEST_TRANSACTION_INQUIRY_KEY = TransactionInquiryKeyFactory.create({
        theater_code: 'xxx',
        reserve_num: 123,
        tel: 'xxx'
    });
}));
function assertSetAnonymousOwner(transactionId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        const anonymousOwner = AnonymousOwnerFactory.create({
            id: ownerId,
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678',
            state: 'state'
        });
        yield TransactionWithIdService.setOwnerProfile(transactionId, anonymousOwner)(ownerAdapter, transactionAdapter);
        // 所有者を検索して情報の一致を確認
        const anonymousOwnerDoc = yield ownerAdapter.model.findById(ownerId).exec();
        assert(anonymousOwnerDoc !== null);
        assert.equal(anonymousOwnerDoc.get('name_first'), anonymousOwner.name_first);
        assert.equal(anonymousOwnerDoc.get('name_last'), anonymousOwner.name_last);
        assert.equal(anonymousOwnerDoc.get('email'), anonymousOwner.email);
        assert.equal(anonymousOwnerDoc.get('tel'), anonymousOwner.tel);
        assert.equal(anonymousOwnerDoc.get('state'), anonymousOwner.state);
        assert.equal(anonymousOwnerDoc.get('group'), anonymousOwner.group);
    });
}
function assertSetMemberOwner(transactionId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        const password = 'password';
        const memberOwner = yield MemberOwnerFactory.create({
            id: ownerId,
            username: `sskts-domain:test:service:transactionWithId-test:username:${moment().valueOf()}`,
            password: password,
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678',
            state: 'state'
        });
        yield TransactionWithIdService.setOwnerProfile(transactionId, memberOwner)(ownerAdapter, transactionAdapter);
        // 所有者を検索して情報の一致を確認
        const ownerDoc = yield ownerAdapter.model.findById(ownerId).exec();
        assert(ownerDoc !== null);
        assert.equal(ownerDoc.get('username'), memberOwner.username);
        assert(yield bcrypt.compare(password, ownerDoc.get('password_hash')));
        assert.equal(ownerDoc.get('name_first'), memberOwner.name_first);
        assert.equal(ownerDoc.get('name_first'), memberOwner.name_first);
        assert.equal(ownerDoc.get('name_last'), memberOwner.name_last);
        assert.equal(ownerDoc.get('email'), memberOwner.email);
        assert.equal(ownerDoc.get('tel'), memberOwner.tel);
        assert.equal(ownerDoc.get('state'), memberOwner.state);
        assert.equal(ownerDoc.get('group'), memberOwner.group);
    });
}
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
    it('成立できる', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        yield TransactionWithIdService.close(transaction.id)(transactionAdapter);
        const transactionDoc = yield transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert(transactionDoc !== null);
        assert.equal(transactionDoc.get('status'), transactionStatus_1.default.CLOSED);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成するが、DBには保管しない
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const closeError = yield TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(closeError instanceof Error);
    }));
    it('進行中ステータスでなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.EXPIRED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        const closeError = yield TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(closeError instanceof Error);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
    it('照会可能になっていなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // 照会キーのないテストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        const closeError = yield TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(closeError instanceof Error);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
    it('条件が対等でなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { new: true, upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { new: true, upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        // 片方の所有者だけ承認を追加する
        const authorization = Object.assign({}, TEST_GMO_AUTHORIZATION, { owner_from: ownerFrom.id, owner_to: ownerTo.id });
        yield TransactionWithIdService.addGMOAuthorization(transaction.id, authorization)(transactionAdapter);
        // 承認金額のバランスが合わないので失敗するはず
        const closeError = yield TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
            return error;
        });
        assert(closeError instanceof Error);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
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
describe('Eメール通知追加', () => {
    it('追加できる', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield TransactionWithIdService.addEmail(transaction.id, TEST_EMAIL_NOTIFICATION)(transactionAdapter);
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({ 'notification.id': TEST_EMAIL_NOTIFICATION.id }).exec();
        assert(transactionEvent !== null);
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('通知削除', () => {
    it('削除できる', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionEvent = AddNotificationTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            notification: TEST_EMAIL_NOTIFICATION
        });
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield transactionAdapter.transactionEventModel.findByIdAndUpdate(transactionEvent.id, transactionEvent, { upsert: true }).exec();
        yield TransactionWithIdService.removeEmail(transaction.id, TEST_EMAIL_NOTIFICATION.id)(transactionAdapter);
        // 承認削除取引イベントが作成されているはず
        const removeNotificationTransactionEventDocs = yield transactionAdapter.transactionEventModel.findOne({
            'notification.id': TEST_EMAIL_NOTIFICATION.id,
            group: transactionEventGroup_1.default.REMOVE_NOTIFICATION
        }).exec();
        assert(removeNotificationTransactionEventDocs !== null);
        assert(removeNotificationTransactionEventDocs.get('transaction'), transaction.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const removeNotificationError = yield TransactionWithIdService.removeEmail(transaction.id, TEST_EMAIL_NOTIFICATION.id)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(removeNotificationError instanceof argument_1.default);
        assert.equal(removeNotificationError.argumentName, 'transactionId');
    }));
    it('通知が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const removeNotificationError = yield TransactionWithIdService.removeEmail(transaction.id, TEST_EMAIL_NOTIFICATION.id)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(removeNotificationError instanceof argument_1.default);
        assert.equal(removeNotificationError.argumentName, 'notificationId');
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
describe('匿名所有者更新', () => {
    it('更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const profile = {
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678'
        };
        const args = Object.assign({}, profile, { transaction_id: transaction.id });
        yield TransactionWithIdService.updateAnonymousOwner(args)(ownerAdapter, transactionAdapter);
        // 所有者を検索して情報の一致を確認
        const anonymousOwnerDoc = yield ownerAdapter.model.findById(ownerTo.id).exec();
        assert(anonymousOwnerDoc !== null);
        assert.equal(anonymousOwnerDoc.get('name_first'), profile.name_first);
        assert.equal(anonymousOwnerDoc.get('name_last'), profile.name_last);
        assert.equal(anonymousOwnerDoc.get('email'), profile.email);
        assert.equal(anonymousOwnerDoc.get('tel'), profile.tel);
        assert.equal(anonymousOwnerDoc.get('group'), ownerGroup_1.default.ANONYMOUS);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const profile = {
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678'
        };
        const args = Object.assign({}, profile, { transaction_id: transaction.id });
        const updateAnonymousOwnerError = yield TransactionWithIdService.updateAnonymousOwner(args)(ownerAdapter, transactionAdapter).catch((error) => error);
        assert(updateAnonymousOwnerError instanceof argument_1.default);
        assert.equal(updateAnonymousOwnerError.argumentName, 'transaction_id');
    }));
    it('匿名所有者が取引内に存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        // あえて匿名所有者ではないグループの所有者を作成
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, Object.assign({}, ownerTo, { group: 'invalidgroup' }), { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const profile = {
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678'
        };
        const args = Object.assign({}, profile, { transaction_id: transaction.id });
        const updateAnonymousOwnerError = yield TransactionWithIdService.updateAnonymousOwner(args)(ownerAdapter, transactionAdapter).catch((error) => error);
        assert(updateAnonymousOwnerError instanceof argument_1.default);
        assert.equal(updateAnonymousOwnerError.argumentName, 'transaction_id');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('所有者プロフィールセット', () => {
    it('匿名所有者として更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield assertSetAnonymousOwner(transaction.id, ownerTo.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('会員所有者として更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('会員所有者として更新後、匿名所有者に戻す', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield assertSetAnonymousOwner(transaction.id, ownerTo.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('会員所有者として繰り返し更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const anonymousOwner = AnonymousOwnerFactory.create({
            id: ownerTo.id,
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678',
            state: 'state'
        });
        const setOwnerProfileError = yield TransactionWithIdService.setOwnerProfile(transaction.id, anonymousOwner)(ownerAdapter, transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof argument_1.default);
        assert.equal(setOwnerProfileError.argumentName, 'transactionId');
    }));
    it('匿名所有者が取引内に存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const anonymousOwner = AnonymousOwnerFactory.create({
            // id: ownerTo.id, // あえて新しいIDの所有者を作成する
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678',
            state: 'state'
        });
        const setOwnerProfileError = yield TransactionWithIdService.setOwnerProfile(transaction.id, anonymousOwner)(ownerAdapter, transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof argument_1.default);
        assert.equal(setOwnerProfileError.argumentName, 'owner');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('カード保管', () => {
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const setOwnerProfileError = yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof argument_1.default);
        assert.equal(setOwnerProfileError.argumentName, 'transactionId');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('所有者が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        const setOwnerProfileError = yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof argument_1.default);
        assert.equal(setOwnerProfileError.argumentName, 'ownerId');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('会員未登録であれば失敗', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        // 会員未登録なのでエラーになるはず
        const setOwnerProfileError = yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof argument_1.default);
        assert.equal(setOwnerProfileError.argumentName, 'ownerId');
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('会員登録済みであれば成功する', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        // 取引に会員セット(この中でGMO会員登録される)
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        // GMO会員登録済みなのでカード登録できるはず
        yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
    it('会員登録+カード保存を繰り返しても成功する', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        // 取引に会員セット(この中でGMO会員登録される)
        // GMO会員登録済みなのでカード登録できるはず
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);
        yield assertSetMemberOwner(transaction.id, ownerTo.id);
        yield TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
describe('照合を可能にする', () => {
    it('成功', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        yield TransactionWithIdService.enableInquiry(transaction.id, TEST_TRANSACTION_INQUIRY_KEY)(transactionAdapter);
        // 取引を検索して照会キーの一致を確認
        const transactionDoc = yield transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert(transactionDoc !== null);
        assert.deepEqual(transactionDoc.get('inquiry_key'), TEST_TRANSACTION_INQUIRY_KEY);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
    it('取引が存在しなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const enableInquiryError = yield TransactionWithIdService.enableInquiry(transaction.id, TEST_TRANSACTION_INQUIRY_KEY)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(enableInquiryError instanceof Error);
    }));
    it('取引が進行中でなければ失敗', () => __awaiter(this, void 0, void 0, function* () {
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.EXPIRED,
            owners: [],
            expires_at: new Date()
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();
        const enableInquiryError = yield TransactionWithIdService.enableInquiry(transaction.id, TEST_TRANSACTION_INQUIRY_KEY)(transactionAdapter).catch((error) => {
            return error;
        });
        assert(enableInquiryError instanceof Error);
        // テストデータ削除
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    }));
});
