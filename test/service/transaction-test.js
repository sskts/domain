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
// tslint:disable-next-line:missing-jsdoc
const assert = require("assert");
const moment = require("moment");
const mongoose = require("mongoose");
const sskts = require("../../lib/index");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    // 全て削除してからテスト開始
    const transactionAdapter = sskts.createTransactionAdapter(connection);
    yield transactionAdapter.transactionModel.remove({}).exec();
}));
describe('transaction service', () => {
    it('start fail', (done) => {
        const ownerAdapter = sskts.createOwnerAdapter(connection);
        const transactionAdapter = sskts.createTransactionAdapter(connection);
        const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
        sskts.service.transaction.start(expiresAt)(ownerAdapter, transactionAdapter)
            .then((transactionOption) => {
            assert(transactionOption.isEmpty);
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('prepare ok', (done) => {
        sskts.service.transaction.prepare(3, 60)(sskts.createTransactionAdapter(connection)) // tslint:disable-line:no-magic-numbers
            .then(() => {
            done();
        })
            .catch((err) => {
            done(err);
        });
    });
    it('start ok', (done) => {
        const ownerAdapter = sskts.createOwnerAdapter(connection);
        const transactionAdapter = sskts.createTransactionAdapter(connection);
        sskts.service.transaction.prepare(1, 60)(transactionAdapter) // tslint:disable-line:no-magic-numbers
            .then(() => {
            const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
            sskts.service.transaction.start(expiresAt)(ownerAdapter, transactionAdapter)
                .then((transactionOption) => {
                assert(transactionOption.isDefined);
                assert.equal(transactionOption.get().status, sskts.factory.transactionStatus.UNDERWAY);
                assert.equal(transactionOption.get().expires_at.valueOf(), expiresAt.valueOf());
                done();
            })
                .catch((err) => {
                done(err);
            });
        })
            .catch((err) => {
            done(err);
        });
    });
    it('makeExpired ok', (done) => {
        const transactionAdapter = sskts.createTransactionAdapter(connection);
        // 期限切れの取引を作成
        sskts.service.transaction.prepare(3, -60)(transactionAdapter) // tslint:disable-line:no-magic-numbers
            .then(() => {
            sskts.service.transaction.makeExpired()(transactionAdapter)
                .then(() => {
                done();
            })
                .catch((err) => {
                done(err);
            });
        })
            .catch((err) => {
            done(err);
        });
    });
});
