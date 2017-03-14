// tslint:disable-next-line:missing-jsdoc
import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const transactionAdapter = sskts.createTransactionAdapter(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
});

describe('transaction service', () => {
    it('startIfPossible fail', (done) => {
        const ownerAdapter = sskts.createOwnerAdapter(connection);
        const transactionAdapter = sskts.createTransactionAdapter(connection);
        const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
        sskts.service.transaction.startIfPossible(expiresAt)(ownerAdapter, transactionAdapter)
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

    it('startIfPossible ok', (done) => {
        const ownerAdapter = sskts.createOwnerAdapter(connection);
        const transactionAdapter = sskts.createTransactionAdapter(connection);
        sskts.service.transaction.prepare(1, 60)(transactionAdapter) // tslint:disable-line:no-magic-numbers
            .then(() => {
                const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
                sskts.service.transaction.startIfPossible(expiresAt)(ownerAdapter, transactionAdapter)
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

    it('startForcibly ok', (done) => {
        const ownerAdapter = sskts.createOwnerAdapter(connection);
        const transactionAdapter = sskts.createTransactionAdapter(connection);
        const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
        sskts.service.transaction.startForcibly(expiresAt)(ownerAdapter, transactionAdapter)
            .then((transaction) => {
                assert.equal(transaction.expires_at.valueOf(), expiresAt.valueOf());
                done();
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
