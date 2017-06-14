/**
 * 取引(ID指定)サービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as mongoose from 'mongoose';

import * as TransactionWithIdService from '../../lib/service/transactionWithId';

import OwnerAdapter from '../../lib/adapter/owner';
import TransactionAdapter from '../../lib/adapter/transaction';

import AssetGroup from '../../lib/factory/assetGroup';
import * as COASeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../../lib/factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../../lib/factory/authorization/mvtk';
import ObjectId from '../../lib/factory/objectId';
import * as AnonymousOwnerFactory from '../../lib/factory/owner/anonymous';
import * as OwnershipFactory from '../../lib/factory/ownership';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AuthorizeTransactionEventFactory from '../../lib/factory/transactionEvent/authorize';
import TransactionEventGroup from '../../lib/factory/transactionEventGroup';
import TransactionStatus from '../../lib/factory/transactionStatus';

import ArgumentError from '../../lib/error/argument';

let TEST_COA_SEAT_RESERVATION_AUTHORIZATION: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization;
let TEST_GMO_AUTHORIZATION: GMOAuthorizationFactory.IGMOAuthorization;
let TEST_MVTK_AUTHORIZATION: MvtkAuthorizationFactory.IMvtkAuthorization;
let connection: mongoose.Connection;

before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const transactionAdapter = new TransactionAdapter(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
    await transactionAdapter.transactionEventModel.remove({}).exec();

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
});

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
    // todo テストコード
    it('照会可能になっていなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);

        // 照会キーのないテストデータ作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();

        let closeError: any;
        try {
            await TransactionWithIdService.close(transaction.id)(transactionAdapter);
        } catch (error) {
            closeError = error;
        }

        assert(closeError instanceof Error);

        // テストデータ削除
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
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
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne(
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
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne(
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
        const transactionEvent = await transactionAdapter.transactionEventModel.findOne(
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
        ).catch((error) => {
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
        ).catch((error) => {
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
        ).catch((error) => {
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
        const unauthorizeTransactionEventDocs = await transactionAdapter.transactionEventModel.findOne(
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
