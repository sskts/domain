// tslint:disable-next-line:missing-jsdoc
import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

import * as notificationFactory from '../../lib/factory/notification';
import * as transactionFactory from '../../lib/factory/transaction';
import * as transactionEvent from '../../lib/factory/transactionEvent';
import * as transactionInquiryKey from '../../lib/factory/transactionInquiryKey';
import transactionQueuesStatus from '../../lib/factory/transactionQueuesStatus';
import transactionStatus from '../../lib/factory/transactionStatus';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
});

describe('transaction service', () => {
    it('startIfPossible fail', (done) => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
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

    it('exportQueues ok.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const transaction = transactionFactory.create({
            status: transactionStatus.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: transactionInquiryKey.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus.UNEXPORTED
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();

        const status = await sskts.service.transaction.exportQueues()(queueAdapter, transactionAdapter);
        assert.equal(status, transactionQueuesStatus.EXPORTED);
    });

    it('exportQueuesById ok.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const transaction = transactionFactory.create({
            status: transactionStatus.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: transactionInquiryKey.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus.UNEXPORTED
        });

        const event = transactionEvent.createNotificationAdd({
            transaction: transaction.id,
            occurred_at: new Date(),
            notification: notificationFactory.createEmail({
                from: 'noreply@localhost',
                to: 'hello',
                subject: 'sskts-domain:test:service:transaction-test',
                content: 'sskts-domain:test:service:transaction-test'
            })
        });

        // todo オーソリイベントもテストデータに追加する

        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
        await transactionAdapter.addEvent(event);

        const queueIds = await sskts.service.transaction.exportQueuesById(transaction.id)(queueAdapter, transactionAdapter);
        const numberOfQueues = await queueAdapter.model.count({ _id: { $in: queueIds } }).exec();
        assert.equal(numberOfQueues, queueIds.length);
    });

    it('reexportQueues ok.', async () => {
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const transaction = transactionFactory.create({
            status: transactionStatus.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: transactionInquiryKey.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: transactionQueuesStatus.EXPORTING
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();

        await sskts.service.transaction.reexportQueues(0)(transactionAdapter); // tslint:disable-line:no-magic-numbers

        // ステータスが変更されているかどうか確認
        const retriedTransaction = await transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert.equal(retriedTransaction.get('queues_status'), transactionQueuesStatus.UNEXPORTED);
    });

    it('prepare ok', (done) => {
        sskts.service.transaction.prepare(3, 60)(sskts.adapter.transaction(connection)) // tslint:disable-line:no-magic-numbers
            .then(() => {
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('makeExpired ok', (done) => {
        const transactionAdapter = sskts.adapter.transaction(connection);
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

    it('startIfPossible ok', (done) => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
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
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
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
});
