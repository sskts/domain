"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引ファクトリーテスト
 *
 * @ignore
 */
const assert = require("assert");
const argument_1 = require("../../lib/error/argument");
const argumentNull_1 = require("../../lib/error/argumentNull");
const TransactionFactory = require("../../lib/factory/transaction");
const transactionStatus_1 = require("../../lib/factory/transactionStatus");
describe('取引ファクトリー', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TransactionFactory.create({
                status: transactionStatus_1.default.CLOSED,
                owners: [],
                expires_at: new Date()
            });
        });
    });
    it('ステータスが空なので作成できない', () => {
        assert.throws(() => {
            TransactionFactory.create({
                status: '',
                owners: [],
                expires_at: new Date()
            });
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'status');
            return true;
        });
    });
    it('所有者リストが配列でないので作成できない', () => {
        assert.throws(() => {
            TransactionFactory.create({
                status: transactionStatus_1.default.CLOSED,
                owners: {},
                expires_at: new Date()
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'owners');
            return true;
        });
    });
    it('期限が不適切なので作成できない', () => {
        assert.throws(() => {
            TransactionFactory.create({
                status: transactionStatus_1.default.CLOSED,
                owners: [],
                expires_at: {}
            });
        }, (err) => {
            assert(err instanceof argument_1.default);
            assert.equal(err.argumentName, 'expires_at');
            return true;
        });
    });
});
