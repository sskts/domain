/**
 * 取引(ID指定)サービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as bcrypt from 'bcryptjs';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import * as TransactionWithIdService from '../../lib/service/transactionWithId';

import OwnerAdapter from '../../lib/adapter/owner';
import TransactionAdapter from '../../lib/adapter/transaction';

import AssetGroup from '../../lib/factory/assetGroup';
import * as COASeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../../lib/factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../../lib/factory/authorization/mvtk';
import * as GMOCardFactory from '../../lib/factory/card/gmo';
import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import ObjectId from '../../lib/factory/objectId';
import * as AnonymousOwnerFactory from '../../lib/factory/owner/anonymous';
import * as MemberOwnerFactory from '../../lib/factory/owner/member';
import * as PromoterOwnerFactory from '../../lib/factory/owner/promoter';
import OwnerGroup from '../../lib/factory/ownerGroup';
import * as OwnershipFactory from '../../lib/factory/ownership';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AddNotificationTransactionEventFactory from '../../lib/factory/transactionEvent/addNotification';
import * as AuthorizeTransactionEventFactory from '../../lib/factory/transactionEvent/authorize';
import TransactionEventGroup from '../../lib/factory/transactionEventGroup';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';
import TransactionStatus from '../../lib/factory/transactionStatus';

import ArgumentError from '../../lib/error/argument';

let TEST_COA_SEAT_RESERVATION_AUTHORIZATION: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization;
let TEST_GMO_AUTHORIZATION: GMOAuthorizationFactory.IGMOAuthorization;
let TEST_MVTK_AUTHORIZATION: MvtkAuthorizationFactory.IMvtkAuthorization;
let TEST_EMAIL_NOTIFICATION: EmailNotificationFactory.IEmailNotification;
let TEST_TRANSACTION_INQUIRY_KEY: TransactionInquiryKeyFactory.ITransactionInquiryKey;
let TEST_PROMOTER_OWNER: PromoterOwnerFactory.IPromoterOwner;
let TEST_GMO_CARD: GMOCardFactory.IUncheckedCardRaw;
let connection: mongoose.Connection;

// tslint:disable-next-line:max-func-body-length
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    const ownerAdapter = new OwnerAdapter(connection);
    const transactionAdapter = new TransactionAdapter(connection);

    // 全て削除してからテスト開始
    await ownerAdapter.model.remove({}).exec();
    await transactionAdapter.transactionModel.remove({}).exec();
    await transactionAdapter.transactionEventModel.remove({}).exec();

    // 興行所有者を準備
    const promoterOwnerDoc = <mongoose.Document>await ownerAdapter.model.findOneAndUpdate(
        { group: OwnerGroup.PROMOTER },
        {
            name: {
                ja: '佐々木興業株式会社',
                en: 'Cinema Sunshine Co., Ltd.'
            }
        },
        { new: true, upsert: true }
    ).exec();
    TEST_PROMOTER_OWNER = <PromoterOwnerFactory.IPromoterOwner>promoterOwnerDoc.toObject();

    TEST_GMO_CARD = GMOCardFactory.createUncheckedCardRaw({
        card_no: '4111111111111111',
        card_pass: '111',
        expire: '2812',
        holder_name: 'AA BB'
    });

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
                group: AssetGroup.SEAT_RESERVATION,
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
});

async function assertSetAnonymousOwner(transactionId: string, ownerId: string) {
    const ownerAdapter = new OwnerAdapter(connection);
    const transactionAdapter = new TransactionAdapter(connection);

    const anonymousOwner = AnonymousOwnerFactory.create({
        id: ownerId,
        name_first: 'name_first',
        name_last: 'name_last',
        email: 'noreply@example.com',
        tel: '09012345678',
        state: 'state'
    });
    await TransactionWithIdService.setOwnerProfile(transactionId, anonymousOwner)(ownerAdapter, transactionAdapter);

    // 所有者を検索して情報の一致を確認
    const anonymousOwnerDoc = <mongoose.Document>await ownerAdapter.model.findById(ownerId).exec();
    assert(anonymousOwnerDoc !== null);
    assert.equal(anonymousOwnerDoc.get('name_first'), anonymousOwner.name_first);
    assert.equal(anonymousOwnerDoc.get('name_last'), anonymousOwner.name_last);
    assert.equal(anonymousOwnerDoc.get('email'), anonymousOwner.email);
    assert.equal(anonymousOwnerDoc.get('tel'), anonymousOwner.tel);
    assert.equal(anonymousOwnerDoc.get('state'), anonymousOwner.state);
    assert.equal(anonymousOwnerDoc.get('group'), anonymousOwner.group);
}

async function assertSetMemberOwner(transactionId: string, ownerId: string) {
    const ownerAdapter = new OwnerAdapter(connection);
    const transactionAdapter = new TransactionAdapter(connection);

    const password = 'password';
    const memberOwner = await MemberOwnerFactory.create({
        id: ownerId,
        username: `sskts-domain:test:service:transactionWithId-test:username:${moment().valueOf()}`,
        password: password,
        name_first: 'name_first',
        name_last: 'name_last',
        email: 'noreply@example.com',
        tel: '09012345678',
        state: 'state'
    });
    await TransactionWithIdService.setOwnerProfile(transactionId, memberOwner)(ownerAdapter, transactionAdapter);

    // 所有者を検索して情報の一致を確認
    const ownerDoc = <mongoose.Document>await ownerAdapter.model.findById(ownerId).exec();
    assert(ownerDoc !== null);
    assert.equal(ownerDoc.get('username'), memberOwner.username);
    assert(await bcrypt.compare(password, ownerDoc.get('password_hash')));
    assert.equal(ownerDoc.get('name_first'), memberOwner.name_first);
    assert.equal(ownerDoc.get('name_first'), memberOwner.name_first);
    assert.equal(ownerDoc.get('name_last'), memberOwner.name_last);
    assert.equal(ownerDoc.get('email'), memberOwner.email);
    assert.equal(ownerDoc.get('tel'), memberOwner.tel);
    assert.equal(ownerDoc.get('state'), memberOwner.state);
    assert.equal(ownerDoc.get('group'), memberOwner.group);
}

describe('取引サービス IDで取得', () => {
    beforeEach(async () => {
        const transactionAdapter = new TransactionAdapter(connection);
        await transactionAdapter.transactionModel.remove({}).exec();
    });

    it('存在しなければmonapt.None', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        const transactionOption = await TransactionWithIdService.findById(ObjectId().toString())(transactionAdapter);
        assert(transactionOption.isEmpty);
    });

    it('取引存在すればmonapt.Some', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        const transactionOption = await TransactionWithIdService.findById(transaction.id)(transactionAdapter);
        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().id, transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('取引成立', () => {
    it('成立できる', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        await TransactionWithIdService.close(transaction.id)(transactionAdapter);

        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert(transactionDoc !== null);
        assert.equal(transactionDoc.get('status'), TransactionStatus.CLOSED);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });

    it('取引が存在しなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成するが、DBには保管しない
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        const closeError = await TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
                return error;
            });
        assert(closeError instanceof Error);
    });

    it('進行中ステータスでなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.EXPIRED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        const closeError = await TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
                return error;
            });
        assert(closeError instanceof Error);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });

    it('照会可能になっていなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // 照会キーのないテストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        const closeError = await TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
                return error;
            });
        assert(closeError instanceof Error);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });

    it('条件が対等でなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { new: true, upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        // 片方の所有者だけ承認を追加する
        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        await TransactionWithIdService.addGMOAuthorization(transaction.id, authorization)(transactionAdapter);

        // 承認金額のバランスが合わないので失敗するはず
        const closeError = await TransactionWithIdService.close(transaction.id)(transactionAdapter)
            .catch((error) => {
                return error;
            });
        assert(closeError instanceof Error);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('GMO資産承認追加', () => {
    it('成功', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { new: true, upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        await TransactionWithIdService.addGMOAuthorization(transaction.id, authorization)(transactionAdapter);

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = <mongoose.Document>await transactionAdapter.transactionEventModel.findOne(
            { 'authorization.id': authorization.id }
        ).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('COA資産承認追加', () => {
    it('成功', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const authorization = { ...TEST_COA_SEAT_RESERVATION_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        await TransactionWithIdService.addCOASeatReservationAuthorization(transaction.id, authorization)(transactionAdapter);

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = <mongoose.Document>await transactionAdapter.transactionEventModel.findOne(
            { 'authorization.id': authorization.id }
        ).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('ムビチケ着券承認追加', () => {
    it('成功', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const authorization = { ...TEST_MVTK_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        await TransactionWithIdService.addMvtkAuthorization(transaction.id, authorization)(transactionAdapter);

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = <mongoose.Document>await transactionAdapter.transactionEventModel.findOne(
            { 'authorization.id': authorization.id }
        ).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);

        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('承認追加', () => {
    it('取引が存在しなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        const addAuthorizationError = await TransactionWithIdService.addAuthorization(transaction.id, authorization)(
            transactionAdapter
        ).catch((error: any) => {
            return error;
        });
        assert(addAuthorizationError instanceof ArgumentError);
        assert.equal((<ArgumentError>addAuthorizationError).argumentName, 'transactionId');
    });

    it('所有者fromが存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        const addAuthorizationError = await TransactionWithIdService.addAuthorization(transaction.id, authorization)(
            transactionAdapter
        ).catch((error: any) => {
            return error;
        });

        assert(addAuthorizationError instanceof ArgumentError);
        assert.equal((<ArgumentError>addAuthorizationError).argumentName, 'authorization.owner_from');

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('所有者toが存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        const addAuthorizationError = await TransactionWithIdService.addAuthorization(transaction.id, authorization)(
            transactionAdapter
        ).catch((error: any) => {
            return error;
        });

        assert(addAuthorizationError instanceof ArgumentError);
        assert.equal((<ArgumentError>addAuthorizationError).argumentName, 'authorization.owner_to');

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('承認削除', () => {
    it('削除できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        const authorizeEvent = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        await transactionAdapter.transactionEventModel.findByIdAndUpdate(authorizeEvent.id, authorizeEvent, { upsert: true }).exec();

        await TransactionWithIdService.removeAuthorization(transaction.id, authorization.id)(
            transactionAdapter
        );

        // 承認削除取引イベントが作成されているはず
        const unauthorizeTransactionEventDocs = <mongoose.Document>await transactionAdapter.transactionEventModel.findOne(
            {
                'authorization.id': authorization.id,
                group: TransactionEventGroup.UNAUTHORIZE
            }
        ).exec();
        assert(unauthorizeTransactionEventDocs !== null);
        assert(unauthorizeTransactionEventDocs.get('transaction'), transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('取引が存在しなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        const removeAuthorizationError = await TransactionWithIdService.removeAuthorization(transaction.id, authorization.id)(
            transactionAdapter
        ).catch((error) => {
            return error;
        });

        assert(removeAuthorizationError instanceof ArgumentError);
        assert.equal((<ArgumentError>removeAuthorizationError).argumentName, 'transactionId');
    });

    it('承認が存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const authorization = { ...TEST_GMO_AUTHORIZATION, ...{ owner_from: ownerFrom.id, owner_to: ownerTo.id } };
        const removeAuthorizationError = await TransactionWithIdService.removeAuthorization(transaction.id, authorization.id)(
            transactionAdapter
        ).catch((error) => {
            return error;
        });

        assert(removeAuthorizationError instanceof ArgumentError);
        assert.equal((<ArgumentError>removeAuthorizationError).argumentName, 'authorizationId');

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('Eメール通知追加', () => {
    it('追加できる', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        await TransactionWithIdService.addEmail(transaction.id, TEST_EMAIL_NOTIFICATION)(transactionAdapter);

        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = <mongoose.Document>await transactionAdapter.transactionEventModel.findOne(
            { 'notification.id': TEST_EMAIL_NOTIFICATION.id }
        ).exec();
        assert(transactionEvent !== null);
        assert.equal(transactionEvent.get('transaction'), transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('通知削除', () => {
    it('削除できる', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionEvent = AddNotificationTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            notification: TEST_EMAIL_NOTIFICATION
        });

        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        await transactionAdapter.transactionEventModel.findByIdAndUpdate(transactionEvent.id, transactionEvent, { upsert: true }).exec();

        await TransactionWithIdService.removeEmail(transaction.id, TEST_EMAIL_NOTIFICATION.id)(
            transactionAdapter
        );

        // 承認削除取引イベントが作成されているはず
        const removeNotificationTransactionEventDocs = <mongoose.Document>await transactionAdapter.transactionEventModel.findOne(
            {
                'notification.id': TEST_EMAIL_NOTIFICATION.id,
                group: TransactionEventGroup.REMOVE_NOTIFICATION
            }
        ).exec();
        assert(removeNotificationTransactionEventDocs !== null);
        assert(removeNotificationTransactionEventDocs.get('transaction'), transaction.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });

    it('取引が存在しなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        const removeNotificationError = await TransactionWithIdService.removeEmail(transaction.id, TEST_EMAIL_NOTIFICATION.id)(
            transactionAdapter
        ).catch((error) => {
            return error;
        });

        assert(removeNotificationError instanceof ArgumentError);
        assert.equal((<ArgumentError>removeNotificationError).argumentName, 'transactionId');
    });

    it('通知が存在しなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const removeNotificationError = await TransactionWithIdService.removeEmail(transaction.id, TEST_EMAIL_NOTIFICATION.id)(
            transactionAdapter
        ).catch((error) => {
            return error;
        });

        assert(removeNotificationError instanceof ArgumentError);
        assert.equal((<ArgumentError>removeNotificationError).argumentName, 'notificationId');

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('匿名所有者更新', () => {
    it('更新できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const profile = {
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678'
        };
        const args = { ...profile, ...{ transaction_id: transaction.id } };
        await TransactionWithIdService.updateAnonymousOwner(args)(ownerAdapter, transactionAdapter);

        // 所有者を検索して情報の一致を確認
        const anonymousOwnerDoc = <mongoose.Document>await ownerAdapter.model.findById(ownerTo.id).exec();
        assert(anonymousOwnerDoc !== null);
        assert.equal(anonymousOwnerDoc.get('name_first'), profile.name_first);
        assert.equal(anonymousOwnerDoc.get('name_last'), profile.name_last);
        assert.equal(anonymousOwnerDoc.get('email'), profile.email);
        assert.equal(anonymousOwnerDoc.get('tel'), profile.tel);
        assert.equal(anonymousOwnerDoc.get('group'), OwnerGroup.ANONYMOUS);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('取引が存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        const profile = {
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678'
        };
        const args = { ...profile, ...{ transaction_id: transaction.id } };
        const updateAnonymousOwnerError = await TransactionWithIdService.updateAnonymousOwner(args)(
            ownerAdapter, transactionAdapter
        ).catch((error) => error);
        assert(updateAnonymousOwnerError instanceof ArgumentError);
        assert.equal((<ArgumentError>updateAnonymousOwnerError).argumentName, 'transaction_id');
    });

    it('匿名所有者が取引内に存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        // あえて匿名所有者ではないグループの所有者を作成
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, { ...ownerTo, ...{ group: 'invalidgroup' } }, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const profile = {
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678'
        };
        const args = { ...profile, ...{ transaction_id: transaction.id } };
        const updateAnonymousOwnerError = await TransactionWithIdService.updateAnonymousOwner(args)(
            ownerAdapter, transactionAdapter
        ).catch((error) => error);
        assert(updateAnonymousOwnerError instanceof ArgumentError);
        assert.equal((<ArgumentError>updateAnonymousOwnerError).argumentName, 'transaction_id');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('所有者プロフィールセット', () => {
    it('匿名所有者として更新できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        await assertSetAnonymousOwner(transaction.id, ownerTo.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('会員所有者として更新できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        await assertSetMemberOwner(transaction.id, ownerTo.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('会員所有者として更新後、匿名所有者に戻す', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await assertSetAnonymousOwner(transaction.id, ownerTo.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('会員所有者として繰り返し更新できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await assertSetMemberOwner(transaction.id, ownerTo.id);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('取引が存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
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
        const setOwnerProfileError = await TransactionWithIdService.setOwnerProfile(
            transaction.id, anonymousOwner
        )(ownerAdapter, transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof ArgumentError);
        assert.equal((<ArgumentError>setOwnerProfileError).argumentName, 'transactionId');
    });

    it('匿名所有者が取引内に存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const anonymousOwner = AnonymousOwnerFactory.create({
            // id: ownerTo.id, // あえて新しいIDの所有者を作成する
            name_first: 'name_first',
            name_last: 'name_last',
            email: 'noreply@example.com',
            tel: '09012345678',
            state: 'state'
        });
        const setOwnerProfileError = await TransactionWithIdService.setOwnerProfile(
            transaction.id, anonymousOwner
        )(ownerAdapter, transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof ArgumentError);
        assert.equal((<ArgumentError>setOwnerProfileError).argumentName, 'owner');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('カード保管', () => {
    it('取引が存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });

        const setOwnerProfileError = await TransactionWithIdService.saveCard(
            transaction.id, ownerTo.id, TEST_GMO_CARD
        )(transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof ArgumentError);
        assert.equal((<ArgumentError>setOwnerProfileError).argumentName, 'transactionId');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('所有者が存在しなければ失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        const setOwnerProfileError = await TransactionWithIdService.saveCard(
            transaction.id, ownerTo.id, TEST_GMO_CARD
        )(transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof ArgumentError);
        assert.equal((<ArgumentError>setOwnerProfileError).argumentName, 'ownerId');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('会員未登録であれば失敗', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        // 会員未登録なのでエラーになるはず
        const setOwnerProfileError = await TransactionWithIdService.saveCard(
            transaction.id, ownerTo.id, TEST_GMO_CARD
        )(transactionAdapter).catch((error) => error);
        assert(setOwnerProfileError instanceof ArgumentError);
        assert.equal((<ArgumentError>setOwnerProfileError).argumentName, 'ownerId');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('会員登録済みであれば成功する', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        // 取引に会員セット(この中でGMO会員登録される)
        await assertSetMemberOwner(transaction.id, ownerTo.id);

        // GMO会員登録済みなのでカード登録できるはず
        await TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });

    it('会員登録+カード保存を繰り返しても成功する', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const ownerFrom = TEST_PROMOTER_OWNER;
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date()
        });
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();

        // 取引に会員セット(この中でGMO会員登録される)
        // GMO会員登録済みなのでカード登録できるはず
        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);
        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);
        await assertSetMemberOwner(transaction.id, ownerTo.id);
        await TransactionWithIdService.saveCard(transaction.id, ownerTo.id, TEST_GMO_CARD)(transactionAdapter);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});

describe('照合を可能にする', () => {
    it('成功', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        await TransactionWithIdService.enableInquiry(transaction.id, TEST_TRANSACTION_INQUIRY_KEY)(transactionAdapter);

        // 取引を検索して照会キーの一致を確認
        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert(transactionDoc !== null);
        assert.deepEqual(transactionDoc.get('inquiry_key'), TEST_TRANSACTION_INQUIRY_KEY);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });

    it('取引が存在しなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        const enableInquiryError = await TransactionWithIdService.enableInquiry(transaction.id, TEST_TRANSACTION_INQUIRY_KEY)(
            transactionAdapter
        ).catch((error) => {
            return error;
        });
        assert(enableInquiryError instanceof Error);
    });

    it('取引が進行中でなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.EXPIRED,
            owners: [],
            expires_at: new Date()
        });

        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { upsert: true }).exec();

        const enableInquiryError = await TransactionWithIdService.enableInquiry(transaction.id, TEST_TRANSACTION_INQUIRY_KEY)(
            transactionAdapter
        ).catch((error) => {
            return error;
        });
        assert(enableInquiryError instanceof Error);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });

});
