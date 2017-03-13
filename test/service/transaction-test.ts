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
    await transactionAdapter.remove({});
});

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
});
