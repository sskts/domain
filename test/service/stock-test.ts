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

import * as CoaSeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import ObjectId from '../../lib/factory/objectId';
import * as AnonymousOwnerFactory from '../../lib/factory/owner/anonymous';
import * as TransactionFactory from '../../lib/factory/transaction';

import * as MasterService from '../../lib/service/master';
import * as StockService from '../../lib/service/stock';

let connection: mongoose.Connection;
let testPerformance: mongoose.Document;
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
    testPerformance = await performanceAdapter.model.findOne().exec();
});

describe('在庫サービス 取引照会無効化', () => {
    it('照会キーがなければ失敗', async () => {
        const transactionAdapter = new TransactionAdapter(connection);
        const transaction = TransactionFactory.create({
            status: 'UNDERWAY',
            owners: [],
            expires_at: new Date()
        });

        let disableTransactionInquiryError: any;
        try {
            await StockService.disableTransactionInquiry(transaction)(transactionAdapter);
        } catch (error) {
            disableTransactionInquiryError = error;
        }

        assert(disableTransactionInquiryError instanceof ArgumentError);
        assert.equal((<ArgumentError>disableTransactionInquiryError).argumentName, 'transaction.inquiry_key');
    });
});

describe('在庫サービス 座席予約資産移動', () => {
    // tslint:disable-next-line:max-func-body-length
    it('成功', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        const ownerTo = AnonymousOwnerFactory.create({
            id: '58e344ac36a44424c0997dad',
            name_first: 'てすと',
            name_last: 'てすと',
            email: 'test@example.com',
            tel: '09012345678'
        });
        const authorization: CoaSeatReservationAuthorizationFactory.ICOASeatReservationAuthorization = {
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
                    performance: testPerformance.get('_id'),
                    authorizations: [],
                    price: 2800,
                    group: 'SEAT_RESERVATION',
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
                    performance: testPerformance.get('_id'),
                    authorizations: [],
                    price: 2800,
                    group: 'SEAT_RESERVATION',
                    ownership: {
                        authentication_records: [],
                        owner: '58e344ac36a44424c0997dad',
                        id: '58e344b236a44424c0997db0'
                    },
                    id: '58e344b236a44424c0997db1'
                }
            ],
            owner_to: ownerTo.id,
            owner_from: '5868e16789cc75249cdbfa4b',
            price: 5600,
            coa_screen_code: '60',
            coa_time_begin: '0950',
            coa_title_branch_num: '0',
            coa_title_code: '17165',
            coa_date_jouei: '20170404',
            coa_theater_code: '118',
            coa_tmp_reserve_num: 1103,
            group: 'COA_SEAT_RESERVATION',
            id: '58e344b236a44424c0997db2'
        };
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { upsert: true }).exec();

        await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter);

        // 資産の存在を確認
        const asset1Doc = await assetAdapter.model.findById('58e344b236a44424c0997daf').exec();
        assert.notEqual(asset1Doc, null);
        assert.equal(asset1Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset1Doc.get('performance'), testPerformance.get('_id'));
        assert.equal(asset1Doc.get('seat_code'), 'Ａ－３');
        assert.equal(asset1Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        const asset2Doc = await assetAdapter.model.findById('58e344b236a44424c0997db1').exec();
        assert.notEqual(asset2Doc, null);
        assert.equal(asset2Doc.get('mvtk_sales_price'), 0);
        assert.equal(asset2Doc.get('performance'), testPerformance.get('_id'));
        assert.equal(asset2Doc.get('seat_code'), 'Ａ－４');
        assert.equal(asset2Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
    });

    it('所有者が存在しないので座席予約資産移動失敗', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        const authorization = CoaSeatReservationAuthorizationFactory.create({
            price: 4000,
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: ObjectId().toString(),
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
            await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter);
        } catch (error) {
            assert(error instanceof ArgumentError);
            assert.equal((<ArgumentError>error).argumentName, 'authorization.owner_to');

            return;
        }

        throw new Error('should not be passed');
    });

    it('所有者が一般所有者ではないので座席予約資産移動失敗', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);
        const performanceAdapter = new PerformanceAdapter(connection);

        // テストデータ作成
        const ownerDoc = await ownerAdapter.model.create({ group: 'xxx' });

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

        let transferCOASeatReservationError: any;
        try {
            await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter);
        } catch (error) {
            transferCOASeatReservationError = error;
        }

        // テストデータ削除
        await ownerDoc.remove();

        assert(transferCOASeatReservationError instanceof Error);
    });
});
