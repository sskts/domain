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

import AssetGroup from '../../lib/factory/assetGroup';
import * as CoaSeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import AuthorizationGroup from '../../lib/factory/authorizationGroup';
import ObjectId from '../../lib/factory/objectId';
import * as TransactionFactory from '../../lib/factory/transaction';

import * as StockService from '../../lib/service/stock';

let connection: mongoose.Connection;
before(() => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('在庫サービス', () => {
    it('照会キーがないので取引照会無効化失敗', async () => {
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

        assert(disableTransactionInquiryError instanceof Error);
    });

    it('COAで本予約できないので座席予約資産移動失敗', async () => {
        const assetAdapter = new AssetAdapter(connection);
        const ownerAdapter = new OwnerAdapter(connection);

        const authorization: CoaSeatReservationAuthorizationFactory.ICOASeatReservationAuthorization = {
            id: '58e1e6d268ae4a2fc8f4e4c0',
            group: AuthorizationGroup.COA_SEAT_RESERVATION,
            coa_tmp_reserve_num: 995,
            coa_theater_code: '118',
            coa_date_jouei: '20170403',
            coa_title_code: '16344',
            coa_title_branch_num: '0',
            coa_time_begin: '1000',
            coa_screen_code: '30',
            price: 4000,
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: '58e1e6cc68ae4a2fc8f4e4bb',
            assets: [
                {
                    id: '58e1e6d268ae4a2fc8f4e4bd',
                    ownership: {
                        id: '58e1e6d268ae4a2fc8f4e4bc',
                        owner: '58e1e6cc68ae4a2fc8f4e4bb',
                        authenticated: false
                    },
                    group: AssetGroup.SEAT_RESERVATION,
                    price: 2000,
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: '   ',
                    seat_code: 'Ｂ－４',
                    ticket_code: '10',
                    ticket_name_ja: '当日一般',
                    ticket_name_en: 'General Price',
                    ticket_name_kana: 'トウジツイッパン',
                    std_price: 1800,
                    add_price: 200,
                    dis_price: 0,
                    sale_price: 2000,
                    mvtk_app_price: 0,
                    add_glasses: 0
                },
                {
                    id: '58e1e6d268ae4a2fc8f4e4bf',
                    ownership: {
                        id: '58e1e6d268ae4a2fc8f4e4be',
                        owner: '58e1e6cc68ae4a2fc8f4e4bb',
                        authenticated: false
                    },
                    group: AssetGroup.SEAT_RESERVATION,
                    price: 2000,
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: '   ',
                    seat_code: 'Ｂ－５',
                    ticket_code: '10',
                    ticket_name_ja: '当日一般',
                    ticket_name_en: 'General Price',
                    ticket_name_kana: 'トウジツイッパン',
                    std_price: 1800,
                    add_price: 200,
                    dis_price: 0,
                    sale_price: 2000,
                    mvtk_app_price: 0,
                    add_glasses: 0
                }
            ]
        };

        try {
            await StockService.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter);
        } catch (error) {
            assert(error instanceof Error);
            assert.equal((<Error>error).message, '本予約失敗');
            return;
        }

        throw new Error('should not be passed');
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
