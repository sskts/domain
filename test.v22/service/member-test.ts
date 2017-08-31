/**
 * 会員サービステスト
 *
 * @ignore
 */

import * as GMO from '@motionpicture/gmo-service';
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import AlreadyInUseError from '../../lib/error/alreadyInUse';
import ArgumentError from '../../lib/error/argument';

import AssetAdapter from '../../lib/adapter/asset';
import OwnerAdapter from '../../lib/adapter/owner';

import * as SeatReservationAssetFactory from '../../lib/factory/asset/seatReservation';
import * as GMOCardFactory from '../../lib/factory/card/gmo';
import * as MemberOwnerFactory from '../../lib/factory/owner/member';
import OwnerGroup from '../../lib/factory/ownerGroup';
import * as OwnershipFactory from '../../lib/factory/ownership';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';

import * as MemberService from '../../lib/service/member';

const TEST_PASSWORD = 'password';
let TEST_MEMBER_OWNER: MemberOwnerFactory.IOwner;
let TEST_MEMBER_VARIABLE_FIELDS: MemberOwnerFactory.IVariableFields;
let TEST_GMO_CARD: GMOCardFactory.IUncheckedCardRaw;
let TEST_SEAT_RESERVATION_ASSET: SeatReservationAssetFactory.IAsset;

let connection: mongoose.Connection;

// tslint:disable-next-line:max-func-body-length
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const ownerAdapter = new OwnerAdapter(connection);
    await ownerAdapter.model.remove({ group: OwnerGroup.ANONYMOUS }).exec();

    TEST_MEMBER_OWNER = await MemberOwnerFactory.create({
        username: `sskts-domain:test:service:member-test:${Date.now().toString()}`,
        password: TEST_PASSWORD,
        name_first: 'name_first',
        name_last: 'name_last',
        email: process.env.SSKTS_DEVELOPER_EMAIL
    });
    // GMO会員登録
    await GMO.services.card.saveMember({
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
});

after(async () => {
    // テスト会員削除
    const ownerAdapter = new OwnerAdapter(connection);
    await ownerAdapter.model.findByIdAndRemove(TEST_MEMBER_OWNER.id).exec();
});

describe('会員サービス 新規登録', () => {
    it('ユーザーネームが重複すればエラー', async () => {
        // まず登録
        const ownerAdapter = new OwnerAdapter(connection);
        const memberOwner = await MemberOwnerFactory.create({
            username: `sskts-domain:test:service:member-test:${Date.now().toString()}`,
            password: TEST_PASSWORD,
            name_first: 'name_first',
            name_last: 'name_last',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });

        await MemberService.signUp(memberOwner)(ownerAdapter);

        // 同じユーザーネームで登録
        const memberOwner2 = await MemberOwnerFactory.create({
            username: memberOwner.username,
            password: TEST_PASSWORD,
            name_first: 'name_first',
            name_last: 'name_last',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });

        const signUpError = await MemberService.signUp(memberOwner2)(ownerAdapter)
            .catch((error) => error);
        console.error(signUpError);
        assert(signUpError instanceof AlreadyInUseError);
        assert.equal((<AlreadyInUseError>signUpError).entityName, 'owners');

        // テスト会員削除
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('登録できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const memberOwner = await MemberOwnerFactory.create({
            username: `sskts-domain:test:service:member-test:${Date.now().toString()}`,
            password: TEST_PASSWORD,
            name_first: 'name_first',
            name_last: 'name_last',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });

        await MemberService.signUp(memberOwner)(ownerAdapter);

        const ownerDoc = await ownerAdapter.model.findById(memberOwner.id).exec();
        assert(ownerDoc !== null);
        assert.equal((<mongoose.Document>ownerDoc).get('username'), memberOwner.username);

        // テスト会員削除
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });
});

describe('会員サービス ログイン', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('ユーザーネームが存在しなければログインできない', async () => {
        const ownerAdapter = new OwnerAdapter(connection);

        const memberOwnerOption = await MemberService.login(`${TEST_MEMBER_OWNER.username}x`, TEST_PASSWORD)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    });

    it('パスワードが間違っていればログインできない', async () => {
        const ownerAdapter = new OwnerAdapter(connection);

        const memberOwnerOption = await MemberService.login(TEST_MEMBER_OWNER.username, `${TEST_PASSWORD}x`)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    });

    it('ログインできる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);

        // ログインできて、属性が正しいことを確認、ハッシュ化パスワードが返されていないことも確認
        const loginResult = await MemberService.login(TEST_MEMBER_OWNER.username, TEST_PASSWORD)(ownerAdapter);
        assert(loginResult.isDefined);
        const memberOwner = loginResult.get();
        assert.equal(memberOwner.id, TEST_MEMBER_OWNER.id);
        assert.equal(memberOwner.username, TEST_MEMBER_OWNER.username);
    });
});

describe('会員サービス プロフィール取得', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('会員が存在しなければNone', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const memberOwner = await MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const memberOwnerOption = await MemberService.getProfile(memberOwner.id)(ownerAdapter);
        assert(memberOwnerOption.isEmpty);
    });

    it('正しく取得できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const memberOwnerOption = await MemberService.getProfile(TEST_MEMBER_OWNER.id)(ownerAdapter);
        assert(memberOwnerOption.isDefined);
        const memberOwner = memberOwnerOption.get();
        assert.equal(memberOwner.username, TEST_MEMBER_OWNER.username);
    });
});

describe('会員サービス プロフィール更新', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('会員が存在しなければエラー', async () => {
        const ownerAdapter = new OwnerAdapter(connection);

        const memberOwner = await MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const updateProfileError = await MemberService.updateProfile(memberOwner.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter)
            .catch((error) => error);

        assert(updateProfileError instanceof ArgumentError);
        assert.equal((<ArgumentError>updateProfileError).argumentName, 'ownerId');
    });

    it('正しく更新できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);

        await MemberService.updateProfile(TEST_MEMBER_OWNER.id, TEST_MEMBER_VARIABLE_FIELDS)(ownerAdapter);

        const memberOwnerDoc = await ownerAdapter.model.findById(TEST_MEMBER_OWNER.id).exec();
        const memberOwner = <MemberOwnerFactory.IOwner>(<mongoose.Document>memberOwnerDoc).toObject();
        assert.equal(memberOwner.name_first, TEST_MEMBER_VARIABLE_FIELDS.name_first);
        assert.equal(memberOwner.name_last, TEST_MEMBER_VARIABLE_FIELDS.name_last);
        assert.equal(memberOwner.email, TEST_MEMBER_VARIABLE_FIELDS.email);
        assert.equal(memberOwner.tel, TEST_MEMBER_VARIABLE_FIELDS.tel);
        assert.deepEqual(memberOwner.description, TEST_MEMBER_VARIABLE_FIELDS.description);
        assert.deepEqual(memberOwner.notes, TEST_MEMBER_VARIABLE_FIELDS.notes);
    });
});

describe('会員サービス カード追加', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('会員が存在しなければGMOエラー', async () => {
        const memberOwner = await MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const addCardError = await MemberService.addCard(memberOwner.id, TEST_GMO_CARD)()
            .catch((error) => error);
        assert(addCardError instanceof Error);
        assert(/^GMOService/.test((<Error>addCardError).name));
    });

    it('正しく追加できる', async () => {
        // GMOに確かにカードが登録されていることを確認
        const addedCard = await MemberService.addCard(TEST_MEMBER_OWNER.id, TEST_GMO_CARD)();
        const searchCardResults = await GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: addedCard.card_seq
        });
        assert.equal(searchCardResults.length, 1);

        // テストカード削除
        await GMO.services.card.deleteCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: addedCard.card_seq
        });
    });
});

describe('会員サービス カード削除', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('正しく削除できる', async () => {
        // テストカード登録
        const saveCardResult = await GMO.services.card.saveCard({
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
        const cards = await MemberService.findCards(TEST_MEMBER_OWNER.id)();
        const removingCard = <GMOCardFactory.ICheckedCard>cards.find((card) => card.card_seq === saveCardResult.cardSeq);

        // GMOに確かにカードが削除されていることを確認
        await MemberService.removeCard(TEST_MEMBER_OWNER.id, removingCard.id.toString())();
        const searchCardResults = await GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: saveCardResult.cardSeq
        });
        assert.equal(searchCardResults.length, 1);
        assert.equal(searchCardResults[0].deleteFlag, 1);
    });
});

describe('会員サービス カード検索', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('会員が存在しなければ空', async () => {
        const memberOwner = await MemberOwnerFactory.create({
            username: TEST_MEMBER_OWNER.username,
            password: TEST_PASSWORD,
            name_first: TEST_MEMBER_OWNER.name_first,
            name_last: TEST_MEMBER_OWNER.name_last,
            email: TEST_MEMBER_OWNER.email
        });
        const findCardError = await MemberService.findCards(memberOwner.id)()
            .catch((error) => error);
        assert(findCardError instanceof Error);
        assert(/^GMOService/.test((<Error>findCardError).name));
    });

    it('正しく検索できる', async () => {
        // テストカード登録
        const addedCard = await MemberService.addCard(TEST_MEMBER_OWNER.id, TEST_GMO_CARD)();

        // カードの存在確認
        const cards = await MemberService.findCards(TEST_MEMBER_OWNER.id)();
        assert.equal(cards.length, 1);
        assert.equal(cards[0].card_seq, addedCard.card_seq);

        // テストカード削除
        await GMO.services.card.deleteCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: TEST_MEMBER_OWNER.id,
            seqMode: GMO.Util.SEQ_MODE_PHYSICS,
            cardSeq: addedCard.card_seq
        });
    });
});

describe('会員サービス 資産検索', () => {
    beforeEach(async () => {
        // テスト会員情報を初期化
        const ownerAdapter = new OwnerAdapter(connection);
        await ownerAdapter.model.findByIdAndUpdate(TEST_MEMBER_OWNER.id, TEST_MEMBER_OWNER, { upsert: true }).exec();
    });

    it('正しく検索できる', async () => {
        const assetAdapter = new AssetAdapter(connection);

        // テスト資産作成
        const assets = [
            TEST_SEAT_RESERVATION_ASSET
        ];
        await Promise.all(assets.map(async (asset) => {
            await assetAdapter.model.findByIdAndUpdate(asset.id, asset, { upsert: true }).exec();
        }));

        // GMOに確かにカードが削除されていることを確認
        const assetsOfMember = await MemberService.findSeatReservationAssets(TEST_MEMBER_OWNER.id)(assetAdapter);
        assert.equal(assetsOfMember.length, 1);
        assert.equal(assetsOfMember[0].id, TEST_SEAT_RESERVATION_ASSET.id);

        await assetAdapter.model.findByIdAndRemove(TEST_SEAT_RESERVATION_ASSET.id).exec();
    });
});
