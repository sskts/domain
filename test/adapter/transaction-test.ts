/**
 * 取引アダプターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as mongoose from 'mongoose';

import OwnerAdapter from '../../lib/adapter/owner';
import TransactionAdapter from '../../lib/adapter/transaction';

import AssetGroup from '../../lib/factory/assetGroup';
import * as COASeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import * as AnonymousOwnerFactory from '../../lib/factory/owner/anonymous';
import * as OwnershipFactory from '../../lib/factory/ownership';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AuthorizeTransactionEventFactory from '../../lib/factory/transactionEvent/authorize';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';
import TransactionStatus from '../../lib/factory/transactionStatus';

let TEST_COA_SEAT_RESERVATION_AUTHORIZATION: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization;
let TEST_TRANSACTION_INQUIRY_KEY: TransactionInquiryKeyFactory.ITransactionInquiryKey;
let connection: mongoose.Connection;

before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

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

    TEST_TRANSACTION_INQUIRY_KEY = TransactionInquiryKeyFactory.create({
        theater_code: 'xxx',
        reserve_num: 123,
        tel: 'xxx'
    });
});

describe('取引アダプター 金額算出', () => {
    it('正しく算出できる', async () => {
        const ownerAdapter = new OwnerAdapter(connection);
        const transactionAdapter = new TransactionAdapter(connection);

        // テストデータ作成
        // tslint:disable-next-line:insecure-random no-magic-numbers
        const amount = Math.random() * (1000 - 100) + 100;
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        const authorization1 = {
            ...TEST_COA_SEAT_RESERVATION_AUTHORIZATION,
            ...{ price: amount, owner_from: ownerFrom.id, owner_to: ownerTo.id }
        };
        const authorization2 = {
            ...TEST_COA_SEAT_RESERVATION_AUTHORIZATION,
            ...{ price: amount, owner_from: ownerTo.id, owner_to: ownerFrom.id }
        };
        const transactionEvents = [
            AuthorizeTransactionEventFactory.create({
                transaction: transaction.id,
                occurred_at: new Date(),
                authorization: authorization1
            }),
            AuthorizeTransactionEventFactory.create({
                transaction: transaction.id,
                occurred_at: new Date(),
                authorization: authorization2
            })
        ];

        await ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { new: true, upsert: true }).exec();
        await ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { new: true, upsert: true }).exec();
        const transactionDoc = { ...transaction, ...{ owners: transaction.owners.map((owner) => owner.id) } };
        await transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        transactionEvents.forEach(async (event) => {
            await transactionAdapter.transactionEventModel.findByIdAndUpdate(event.id, event, { upsert: true }).exec();
        });

        const amountExpected = await transactionAdapter.calculateAmountById(transaction.id);
        assert.equal(amountExpected, amount);

        // テストデータ削除
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        await ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    });
});
