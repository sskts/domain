"use strict";
/**
 * 取引アダプターテスト
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
const mongoose = require("mongoose");
const owner_1 = require("../../lib/adapter/owner");
const transaction_1 = require("../../lib/adapter/transaction");
const assetGroup_1 = require("../../lib/factory/assetGroup");
const COASeatReservationAuthorizationFactory = require("../../lib/factory/authorization/coaSeatReservation");
const AnonymousOwnerFactory = require("../../lib/factory/owner/anonymous");
const OwnershipFactory = require("../../lib/factory/ownership");
const TransactionFactory = require("../../lib/factory/transaction");
const AuthorizeTransactionEventFactory = require("../../lib/factory/transactionEvent/authorize");
const TransactionInquiryKeyFactory = require("../../lib/factory/transactionInquiryKey");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
let TEST_COA_SEAT_RESERVATION_AUTHORIZATION;
let TEST_TRANSACTION_INQUIRY_KEY;
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
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
    TEST_TRANSACTION_INQUIRY_KEY = TransactionInquiryKeyFactory.create({
        theater_code: 'xxx',
        reserve_num: 123,
        tel: 'xxx'
    });
}));
describe('取引アダプター 金額算出', () => {
    it('正しく算出できる', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = new owner_1.default(connection);
        const transactionAdapter = new transaction_1.default(connection);
        // テストデータ作成
        // tslint:disable-next-line:insecure-random no-magic-numbers
        const amount = Math.random() * (1000 - 100) + 100;
        const ownerFrom = AnonymousOwnerFactory.create({});
        const ownerTo = AnonymousOwnerFactory.create({});
        const transaction = TransactionFactory.create({
            status: transactionStatus_1.default.UNDERWAY,
            owners: [ownerFrom, ownerTo],
            expires_at: new Date(),
            inquiry_key: TEST_TRANSACTION_INQUIRY_KEY
        });
        const authorization1 = Object.assign({}, TEST_COA_SEAT_RESERVATION_AUTHORIZATION, { price: amount, owner_from: ownerFrom.id, owner_to: ownerTo.id });
        const authorization2 = Object.assign({}, TEST_COA_SEAT_RESERVATION_AUTHORIZATION, { price: amount, owner_from: ownerTo.id, owner_to: ownerFrom.id });
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
        yield ownerAdapter.model.findByIdAndUpdate(ownerFrom.id, ownerFrom, { new: true, upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(ownerTo.id, ownerTo, { new: true, upsert: true }).exec();
        const transactionDoc = Object.assign({}, transaction, { owners: transaction.owners.map((owner) => owner.id) });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionDoc.id, transactionDoc, { upsert: true }).exec();
        transactionEvents.forEach((event) => __awaiter(this, void 0, void 0, function* () {
            yield transactionAdapter.transactionEventModel.findByIdAndUpdate(event.id, event, { upsert: true }).exec();
        }));
        const amountExpected = yield transactionAdapter.calculateAmountById(transaction.id);
        assert.equal(amountExpected, amount);
        // テストデータ削除
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerFrom.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(ownerTo.id).exec();
    }));
});
