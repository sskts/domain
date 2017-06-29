"use strict";
/**
 * 会員サービステスト
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
const GMO = require("@motionpicture/gmo-service");
const assert = require("assert");
const mongoose = require("mongoose");
const alreadyInUse_1 = require("../../lib/error/alreadyInUse");
const argument_1 = require("../../lib/error/argument");
const asset_1 = require("../../lib/adapter/asset");
const owner_1 = require("../../lib/adapter/owner");
const SeatReservationAssetFactory = require("../../lib/factory/asset/seatReservation");
const GMOCardFactory = require("../../lib/factory/card/gmo");
const MemberOwnerFactory = require("../../lib/factory/owner/member");
const ownerGroup_1 = require("../../lib/factory/ownerGroup");
const OwnershipFactory = require("../../lib/factory/ownership");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
const MemberService = require("../../lib/service/member");
const TEST_PASSWORD = 'password';
let TEST_MEMBER_OWNER;
let TEST_MEMBER_VARIABLE_FIELDS;
let TEST_GMO_CARD;
let TEST_SEAT_RESERVATION_ASSET;
let connection;
// tslint:disable-next-line:max-func-body-length
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const ownerAdapter = new owner_1.default(connection);
    yield ownerAdapter.model.remove({ group: ownerGroup_1.default.ANONYMOUS }).exec();
    TEST_MEMBER_OWNER = yield MemberOwnerFactory.create({
        username: `sskts-domain:test:service:member-test:${Date.now().toString()}`,
        password: TEST_PASSWORD,
        name_first: 'name_first',
        name_last: 'name_last',
        email: process.env.SSKTS_DEVELOPER_EMAIL
    });
    // GMO会員登録
    yield GMO.services.card.saveMember({
        siteId: process.env.GMO_SITE_ID,
        sitePass: process.env.GMO_SITE_PASS,
        memberId: TEST_MEMBER_OWNER.id,
        memberName: `${TEST_MEMBER_OWNER.name_last} ${TEST_MEMBER_OWNER.name_first}`
    });
    TEST_MEMBER_VARIABLE_FIELDS = {
        name_first: 'new first name',
        name_last: 'new last name',
        email: process.env.SSKTS_DEVELOPER_EMAIL,
        tel: '09012345678',
        description: { en: 'new description en', ja: 'new description ja' },
        notes: { en: 'new notes en', ja: 'new notes ja' }
    };
    TEST_GMO_CARD = GMOCardFactory.createUncheckedCardRaw({
        card_no: '4111111111111111',
        card_pass: '111',
        expire: '2812',
        holder_name: 'AA BB'
    });
    TEST_SEAT_RESERVATION_ASSET = SeatReservationAssetFactory.create({
        ownership: OwnershipFactory.create({
            owner: TEST_MEMBER_OWNER.id
        }),
        performance: 'xxx',
        performance_day: 'xxx',
        performance_time_start: 'xxx',
        performance_time_end: 'xxx',
        theater: 'xxx',
        theater_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        theater_name_kana: 'xxx',
        theater_address: {
            en: 'xxx',
            ja: 'xxx'
        },
        screen: 'xxx',
        screen_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        screen_section: 'xxx',
        seat_code: 'xxx',
        film: 'xxx',
        film_name: {
            en: 'xxx',
            ja: 'xxx'
        },
        film_name_kana: 'xxx',
        film_name_short: 'xxx',
        film_name_original: 'xxx',
        film_minutes: 123,
        film_kbn_eirin: 'xxx',
        film_kbn_eizou: 'xxx',
        film_kbn_joueihousiki: 'xxx',
        film_kbn_jimakufukikae: 'xxx',
        film_copyright: 'xxx',
        transaction_inquiry_key: TransactionInquiryKeyFactory.create({
            theater_code: 'xxx',
            reserve_num: 123,
            tel: '09012345678'
        }),
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
    });
}));
after(() => __awaiter(this, void 0, void 0, function* () {
    // テスト会員削除
    const ownerAdapter = new owner_1.default(connection);
    yield ownerAdapter.model.findByIdAndRemove(TEST_MEMBER_OWNER.id).exec();
}));
describe('会員サービス 新規登録', () => {
    it('ユーザーネームが重複すればエラー', () => __awaiter(this, void 0, void 0, function* () {
        // まず登録
        const ownerAdapter = new owner_1.default(connection);
        const memberOwner = yield MemberOwnerFactory.create({
            username: `sskts-domain:test:service:member-test:${Date.now().toString()}`,
            password: TEST_PASSWORD,
            name_first: 'name_first',
            name_last: 'name_last',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        yield MemberService.signUp(memberOwner)(ownerAdapter);
        // 同じユーザーネームで登録
        const memberOwner2 = yield MemberOwnerFactory.create({
            username: memberOwner.username,
            password: TEST_PASSWORD,
            name_first: 'name_first',
            name_last: 'name_last',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const signUpError = yield MemberService.signUp(memberOwner2)(ownerAdapter)
            .catch((error) => error);
        console.error(signUpError);
        assert(signUpError instanceof alreadyInUse_1.default);
        assert.equal(signUpError.entityName, 'owners');
        // テスト会員削除
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('登録できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const memberOwner = yield MemberOwnerFactory.create({
            username: `sskts-domain:test:service:member-test:${Date.now().toString()}`,
            password: TEST_PASSWORD,
            name_first: 'name_first',
            name_last: 'name_last',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        yield MemberService.signUp(memberOwner)(ownerAdapter);
        const ownerDoc = yield ownerAdapter.model.findById(memberOwner.id).exec();
        assert(ownerDoc !== null);
        assert.equal(ownerDoc.get('username'), memberOwner.username);
        // テスト会員削除
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
});
describe('会員サービス ログイン', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('ユーザーネームが存在しなければログインできない', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const memberOwnerOption = yield MemberService.login(`${TEST_MEMBER_OWNER.username}x`, TEST_PASSWORD)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    }));
    it('パスワードが間違っていればログインできない', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const memberOwnerOption = yield MemberService.login(TEST_MEMBER_OWNER.username, `${TEST_PASSWORD}x`)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    }));
    it('ログインできる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        // ログインできて、属性が正しいことを確認、ハッシュ化パスワードが返されていないことも確認
        const loginResult = yield MemberService.login(TEST_MEMBER_OWNER.username, TEST_PASSWORD)(ownerAdapter);
        assert(loginResult.isDefined);
        const memberOwner = loginResult.get();
        assert.equal(memberOwner.id, TEST_MEMBER_OWNER.id);
        assert.equal(memberOwner.username, TEST_MEMBER_OWNER.username);
    }));
});
describe('会員サービス プロフィール取得', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('会員が存在しなければNone', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const memberOwner = yield MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const memberOwnerOption = yield MemberService.getProfile(memberOwner.id)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    }));
    it('正しく取得できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const memberOwnerOption = yield MemberService.getProfile(TEST_MEMBER_OWNER.id)(ownerAdapter);
        assert(memberOwnerOption.isDefined);
        const memberOwner = memberOwnerOption.get();
        assert.equal(memberOwner.username, TEST_MEMBER_OWNER.username);
    }));
});
describe('会員サービス プロフィール更新', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('会員が存在しなければエラー', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const memberOwner = yield MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const updateProfileError = yield MemberService.updateProfile(memberOwner.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter)
            .catch((error) => error);
        assert(updateProfileError instanceof argument_1.default);
        assert.equal(updateProfileError.argumentName, 'ownerId');
    }));
    it('正しく更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        yield MemberService.updateProfile(TEST_MEMBER_OWNER.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter);
        const memberOwnerDoc = yield ownerAdapter.model.findById(TEST_MEMBER_OWNER.id).exec();
        const memberOwner = memberOwnerDoc.toObject();
        assert.equal(memberOwner.name_first, TEST_MEMBER_VARIABLE_FIELDS.name_first);
        assert.equal(memberOwner.name_last, TEST_MEMBER_VARIABLE_FIELDS.name_last);
        assert.equal(memberOwner.email, TEST_MEMBER_VARIABLE_FIELDS.email);
        assert.equal(memberOwner.tel, TEST_MEMBER_VARIABLE_FIELDS.tel);
        assert.deepEqual(memberOwner.description, TEST_MEMBER_VARIABLE_FIELDS.description);
        assert.deepEqual(memberOwner.notes, TEST_MEMBER_VARIABLE_FIELDS.notes);
    }));
});
describe('会員サービス カード追加', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('会員が存在しなければGMOエラー', () => __awaiter(this, void 0, void 0, function* () {
        const memberOwner = yield MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const addCardError = yield MemberService.addCard(memberOwner.id, TEST_GMO_CARD)()
            .catch((error) => error);
        assert(addCardError instanceof Error);
        assert(/^GMOService/.test(addCardError.name));
    }));
    it('正しく追加できる', () => __awaiter(this, void 0, void 0, function* () {
        // GMOに確かにカードが登録されていることを確認
        const newCardSeq = yield MemberService.addCard(TEST_MEMBER_OWNER.id, TEST_GMO_CARD)();
        const searchCardResults = yield GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: newCardSeq
        });
        assert.equal(searchCardResults.length, 1);
        // テストカード削除
        yield GMO.services.card.deleteCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: newCardSeq
        });
    }));
});
describe('会員サービス カード削除', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('正しく削除できる', () => __awaiter(this, void 0, void 0, function* () {
        // テストカード登録
        const saveCardResult = yield GMO.services.card.saveCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardNo: TEST_GMO_CARD.card_no,
            cardPass: TEST_GMO_CARD.card_pass,
            expire: TEST_GMO_CARD.expire,
            holderName: TEST_GMO_CARD.holder_name
        });
        // 登録されたテストカードを検索して取り出す
        const cards = yield MemberService.findCards(TEST_MEMBER_OWNER.id)();
        const removingCard = cards.find((card) => card.card_seq === saveCardResult.cardSeq);
        // GMOに確かにカードが削除されていることを確認
        yield MemberService.removeCard(TEST_MEMBER_OWNER.id, removingCard.id.toString())();
        const searchCardResults = yield GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: saveCardResult.cardSeq
        });
        assert.equal(searchCardResults.length, 1);
        assert.equal(searchCardResults[0].deleteFlag, 1);
    }));
});
describe('会員サービス カード検索', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('会員が存在しなければ空', () => __awaiter(this, void 0, void 0, function* () {
        const memberOwner = yield MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const findCardError = yield MemberService.findCards(memberOwner.id)()
            .catch((error) => error);
        assert(findCardError instanceof Error);
        assert(/^GMOService/.test(findCardError.name));
    }));
    it('正しく検索できる', () => __awaiter(this, void 0, void 0, function* () {
        // テストカード登録
        const newCardSeq = yield MemberService.addCard(TEST_MEMBER_OWNER.id, TEST_GMO_CARD)();
        // GMOに確かにカードが削除されていることを確認
        const cards = yield MemberService.findCards(TEST_MEMBER_OWNER.id)();
        assert.equal(cards.length, 1);
        assert.equal(cards[0].card_seq, newCardSeq);
        // テストカード削除
        yield GMO.services.card.deleteCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: newCardSeq
        });
    }));
});
describe('会員サービス 資産検索', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員情報を初期化
        const ownerAdapter = new owner_1.default(connection);
        yield ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    }));
    it('正しく検索できる', () => __awaiter(this, void 0, void 0, function* () {
        const assetAdapter = new asset_1.default(connection);
        // テスト資産作成
        const assets = [
            TEST_SEAT_RESERVATION_ASSET
        ];
        yield Promise.all(assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
            yield assetAdapter.model.findByIdAndUpdate(asset.id, asset, { upsert: true }).exec();
        })));
        // GMOに確かにカードが削除されていることを確認
        const assetsOfMember = yield MemberService.findSeatReservationAssets(TEST_MEMBER_OWNER.id)(assetAdapter);
        assert.equal(assetsOfMember.length, 1);
        assert.equal(assetsOfMember[0].id, TEST_SEAT_RESERVATION_ASSET.id);
        yield assetAdapter.model.findByIdAndRemove(TEST_SEAT_RESERVATION_ASSET.id).exec();
    }));
});
