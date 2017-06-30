/**
 * 在庫サービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as mongoose from 'mongoose';

import ArgumentError from '../../lib/error/argument';

import AssetAdapter from '../../lib/adapter/asset';
import FilmAdapter from '../../lib/adapter/film';
import OwnerAdapter from '../../lib/adapter/owner';
import PerformanceAdapter from '../../lib/adapter/performance';
import ScreenAdapter from '../../lib/adapter/screen';
import TheaterAdapter from '../../lib/adapter/theater';
import TransactionAdapter from '../../lib/adapter/transaction';

import AssetGroup from '../../lib/factory/assetGroup';
import * as CoaSeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../../lib/factory/authorization/gmo';
import AuthorizationGroup from '../../lib/factory/authorizationGroup';
import ObjectId from '../../lib/factory/objectId';
import * as AnonymousOwnerFactory from '../../lib/factory/owner/anonymous';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AuthorizeTransactionEventFactory from '../../lib/factory/transactionEvent/authorize';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';
import TransactionStatus from '../../lib/factory/transactionStatus';

import * as MasterService from '../../lib/service/master';
import * as StockService from '../../lib/service/stock';

let TEST_ANOYMOUS_OWNER: AnonymousOwnerFactory.IAnonymousOwner;
let TEST_COA_SEAT_RESERVATION_AUTHORIZATION: CoaSeatReservationAuthorizationFactory.ICOASeatReservationAuthorization;
let TEST_GMO_AUTHORIZATION: GMOAuthorizationFactory.IGMOAuthorization;
let connection: mongoose.Connection;
// tslint:disable-next-line:max-func-body-length
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // テスト用のパフォーマンス情報を取得
    const theaterAdapter = new TheaterAdapter(connection);
    const screenAdapter = new ScreenAdapter(connection);
    const filmAdapter = new FilmAdapter(connection);
    const performanceAdapter = new PerformanceAdapter(connection);

    await MasterService.importTheater('118')(theaterAdapter);
    await MasterService.importScreens('118')(theaterAdapter, screenAdapter);
    await MasterService.importFilms('118')(theaterAdapter, filmAdapter);
    await MasterService.importPerformances('118', '20170401', '20170401')(filmAdapter, screenAdapter, performanceAdapter);
    const perforamnce = <mongoose.Document>await performanceAdapter.model.findOne().exec();

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
                group: AssetGroup.SEAT_RESERVATION,
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
                group: AssetGroup.SEAT_RESERVATION,
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
        group: AuthorizationGroup.COA_SEAT_RESERVATION,
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
});

describe('在庫サービス 取引照会無効化', () => {
    it('照会キーがなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });

        const disableTransactionInquiryError = await StockService.disableTransactionInquiry(transaction)(transactionAdapter)
            .catch((error) => {
                return error;
            });

        assert(disableTransactionInquiryError instanceof ArgumentError);
        assert.equal((<ArgumentError>disableTransactionInquiryError).argumentName, 'transaction.inquiry_key');
    });
});

describe('在庫サービス 座席予約資産移動', () => {
    it('成功', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        const ownerDoc = <mongoose.Document>await ownerAdapter.model.findByIdAndUpdate(
            TEST_ANOYMOUS_OWNER.id, TEST_ANOYMOUS_OWNER, { new: true, upsert: true }
        ).exec();

        await StockService.transferCOASeatReservation(
            TEST_COA_SEAT_RESERVATION_AUTHORIZATION
        )(assetAdapter, ownerAdapter, performanceAdapter);

        // 資産の存在を確認
        const asset1Doc = <mongoose.Document>await assetAdapter.model.findById('58e344b236a44424c0997daf').exec();
        assert.notEqual(asset1Doc, null);
        assert.equal(asset1Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset1Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset1Doc.get('seat_code'), 'Ａ－３');
        assert.equal(asset1Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        const asset2Doc = <mongoose.Document>await assetAdapter.model.findById('58e344b236a44424c0997db1').exec();
        assert.notEqual(asset2Doc, null);
        assert.equal(asset2Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset2Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset2Doc.get('seat_code'), 'Ａ－４');
        assert.equal(asset2Doc.get('ownership').owner, '58e344ac36a44424c0997dad');

        // テストデータ削除
        await ownerDoc.remove();
    });

    it('所有者が存在しないので座席予約資産移動失敗', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        const authorization = { ...TEST_COA_SEAT_RESERVATION_AUTHORIZATION, ...{ owner_to: ObjectId().toString() } };

        const transferError = await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter)
            .catch((error) => {
                return error;
            });
        assert(transferError instanceof ArgumentError);
        assert.equal((<ArgumentError>transferError).argumentName, 'authorization.owner_to');
    });

    it('所有者が一般所有者ではないので座席予約資産移動失敗', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        // テストデータ作成
        const ownerDoc = await ownerAdapter.model.create({ group: 'xxx' });
        const authorization = { ...TEST_COA_SEAT_RESERVATION_AUTHORIZATION, ...{ owner_to: ownerDoc.get('id') } };

        const transferError = await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter)
            .catch((error) => {
                return error;
            });
        assert(transferError instanceof Error);

        // テストデータ削除
        await ownerDoc.remove();
    });
});

describe('在庫サービス 取引IDから座席予約資産移動', () => {
    it('成功', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
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
        const ownerDoc = <mongoose.Document>await ownerAdapter.model.findByIdAndUpdate(
            TEST_ANOYMOUS_OWNER.id, TEST_ANOYMOUS_OWNER, { new: true, upsert: true }
        ).exec();
        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id, transaction, { new: true, upsert: true }
        ).exec();
        await transactionAdapter.addEvent(event);

        await StockService.transferCOASeatReservationByTransactionId(
            transaction.id
        )(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter);

        // 資産の存在を確認
        const asset1Doc = <mongoose.Document>await assetAdapter.model.findById('58e344b236a44424c0997daf').exec();
        assert.notEqual(asset1Doc, null);
        assert.equal(asset1Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset1Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset1Doc.get('seat_code'), 'Ａ－３');
        assert.equal(asset1Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        const asset2Doc = <mongoose.Document>await assetAdapter.model.findById('58e344b236a44424c0997db1').exec();
        assert.notEqual(asset2Doc, null);
        assert.equal(asset2Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset2Doc.get('performance'), TEST_COA_SEAT_RESERVATION_AUTHORIZATION.assets[0].performance);
        assert.equal(asset2Doc.get('seat_code'), 'Ａ－４');
        assert.equal(asset2Doc.get('ownership').owner, '58e344ac36a44424c0997dad');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionDoc.remove();
        await ownerDoc.remove();
    });

    it('取引が存在しなければArgumentError', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // 存在しない取引なのでエラーになるはず
        const transferError = await StockService.transferCOASeatReservationByTransactionId(
            ObjectId().toString()
        )(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
                return error;
            });

        assert(transferError instanceof ArgumentError);
        assert.equal((<ArgumentError>transferError).argumentName, 'transactionId');
    });

    it('成立取引でなければArgumentError', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // 進行中取引をテストデータとして用意する
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [],
            expires_at: new Date()
        });
        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id, transaction, { new: true, upsert: true }
        ).exec();

        const transferError = await StockService.transferCOASeatReservationByTransactionId(
            transaction.id
        )(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
                return error;
            });

        assert(transferError instanceof ArgumentError);
        assert.equal((<ArgumentError>transferError).argumentName, 'transactionId');

        // テストデータ削除
        await transactionDoc.remove();
    });

    it('承認がなければArgumentError', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // 承認のない成立取引をテストデータとして用意する
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id, transaction, { new: true, upsert: true }
        ).exec();

        const transferError = await StockService.transferCOASeatReservationByTransactionId(
            transaction.id
        )(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
                return error;
            });

        assert(transferError instanceof ArgumentError);
        assert.equal((<ArgumentError>transferError).argumentName, 'transactionId');

        // テストデータ削除
        await transactionDoc.remove();
    });

    it('座席予約承認がなければArgumentError', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // GMO承認だけ追加された成立取引をテストデータとして用意する
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });
        const event = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: TEST_GMO_AUTHORIZATION
        });
        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id, transaction, { new: true, upsert: true }
        ).exec();
        await transactionAdapter.addEvent(event);

        const transferError = await StockService.transferCOASeatReservationByTransactionId(
            transaction.id
        )(assetAdapter, ownerAdapter, performanceAdapter, transactionAdapter)
            .catch((error) => {
                return error;
            });

        assert(transferError instanceof ArgumentError);
        assert.equal((<ArgumentError>transferError).argumentName, 'transactionId');

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionDoc.remove();
    });
});
