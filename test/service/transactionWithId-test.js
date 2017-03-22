"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引(ID指定)サービステスト
 *
 * @ignore
 */
const assert = require("assert");
const clone = require("clone");
const mongoose = require("mongoose");
const sskts = require("../../lib/index");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    yield transactionAdapter.transactionModel.remove({}).exec();
    yield transactionAdapter.transactionEventModel.remove({}).exec();
}));
describe('transactionWithId service', () => {
    // todo テストコードをかく
    it('addMvtkAuthorization ok.', () => __awaiter(this, void 0, void 0, function* () {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        // test data
        const owner1 = sskts.factory.owner.anonymous.create({});
        const owner2 = sskts.factory.owner.anonymous.create({});
        const transaction = sskts.factory.transaction.create({
            status: sskts.factory.transactionStatus.UNDERWAY,
            owners: [owner1, owner2],
            expires_at: new Date()
        });
        const authorization = sskts.factory.authorization.mvtk.create({
            price: 1234,
            owner_from: owner1.id,
            owner_to: owner2.id,
            kgygish_cd: '000000',
            yyk_dvc_typ: '00',
            trksh_flg: '0',
            kgygish_sstm_zskyyk_no: 'xxx',
            kgygish_usr_zskyyk_no: 'xxx',
            jei_dt: '2012/02/01 25:45:00',
            kij_ymd: '2012/02/01',
            st_cd: '0000000000',
            scren_cd: '0000000000',
            knyknr_no_info: [],
            zsk_info: [],
            skhn_cd: '0000000000'
        });
        yield ownerAdapter.model.findByIdAndUpdate(owner1.id, owner1, { new: true, upsert: true }).exec();
        yield ownerAdapter.model.findByIdAndUpdate(owner2.id, owner2, { new: true, upsert: true }).exec();
        const update = Object.assign(clone(transaction), { owners: [owner1.id, owner2.id] });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(update.id, update, { new: true, upsert: true }).exec();
        yield sskts.service.transactionWithId.addMvtkAuthorization(transaction.id, authorization)(transactionAdapter);
        // 取引イベントからオーソリIDで検索して、取引IDの一致を確認
        const transactionEvent = yield transactionAdapter.transactionEventModel.findOne({
            'authorization.id': authorization.id
        }).exec();
        assert.equal(transactionEvent.get('transaction'), transaction.id);
        yield transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        yield transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner1.id).exec();
        yield ownerAdapter.model.findByIdAndRemove(owner2.id).exec();
    }));
});
