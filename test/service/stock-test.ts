/**
 * 在庫サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as mongoose from 'mongoose';

import ArgumentError from '../../lib/error/argument';

import AssetAdapter from '../../lib/adapter/asset';
import OwnerAdapter from '../../lib/adapter/owner';
import TransactionAdapter from '../../lib/adapter/transaction';

// import AssetGroup from '../../lib/factory/assetGroup';
import * as CoaSeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
// import AuthorizationGroup from '../../lib/factory/authorizationGroup';
import ObjectId from '../../lib/factory/objectId';
import * as TransactionFactory from '../../lib/factory/transaction';

import * as StockService from '../../lib/service/stock';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
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
    it('成功', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);

        const authorization: CoaSeatReservationAuthorizationFactory.ICOASeatReservationAuthorization = {
            assets: [
                {
                    kbn_eisyahousiki: '00',
                    add_glasses: 0,
                    mvtk_app_price: 0,
                    sale_price: 2800,
                    dis_price: 0,
                    add_price: 1000,
                    std_price: 1800,
                    ticket_name_kana: 'トウジツイッパン',
                    ticket_name_en: 'General Price',
                    ticket_name_ja: '当日一般',
                    ticket_code: '10',
                    seat_code: 'Ａ－３',
                    section: '   ',
                    performance: '001201701208513021010',
                    authorizations: [],
                    price: 2800,
                    group: 'SEAT_RESERVATION',
                    ownership: {
                        authenticated: false,
                        owner: '58e344ac36a44424c0997dad',
                        id: '58e344b236a44424c0997dae'
                    },
                    id: '58e344b236a44424c0997daf'
                },
                {
                    kbn_eisyahousiki: '00',
                    add_glasses: 0,
                    mvtk_app_price: 0,
                    sale_price: 2800,
                    dis_price: 0,
                    add_price: 1000,
                    std_price: 1800,
                    ticket_name_kana: 'トウジツイッパン',
                    ticket_name_en: 'General Price',
                    ticket_name_ja: '当日一般',
                    ticket_code: '10',
                    seat_code: 'Ａ－４',
                    section: '   ',
                    performance: '001201701208513021010',
                    authorizations: [],
                    price: 2800,
                    group: 'SEAT_RESERVATION',
                    ownership: {
                        authenticated: false,
                        owner: '58e344ac36a44424c0997dad',
                        id: '58e344b236a44424c0997db0'
                    },
                    id: '58e344b236a44424c0997db1'
                }
            ],
            owner_to: '58e344ac36a44424c0997dad',
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

        await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);

        // 資産の存在を確認
        const asset1Doc = await assetAdapter.model.findById('58e344b236a44424c0997daf').exec();
        assert.notEqual(asset1Doc, null);
        assert.equal(asset1Doc.get('performance'), '001201701208513021010');
        assert.equal(asset1Doc.get('seat_code'), 'Ａ－３');
        assert.equal(asset1Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
        const asset2Doc = await assetAdapter.model.findById('58e344b236a44424c0997db1').exec();
        assert.notEqual(asset2Doc, null);
        assert.equal(asset2Doc.get('performance'), '001201701208513021010');
        assert.equal(asset2Doc.get('seat_code'), 'Ａ－４');
        assert.equal(asset2Doc.get('ownership').owner, '58e344ac36a44424c0997dad');
    });

    it('所有者が存在しないので座席予約資産移動失敗', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);

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
            await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);
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
            await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);
        } catch (error) {
            transferCOASeatReservationError = error;
        }

        // テストデータ削除
        ownerDoc.remove();

        assert(transferCOASeatReservationError instanceof Error);
    });
});
