/**
 * 取引サービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../../lib/index';

import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import QueueGroup from '../../lib/factory/queueGroup';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AddNotificationTransactionEventFactory from '../../lib/factory/transactionEvent/addNotification';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';
import TransactionQueuesStatus from '../../lib/factory/transactionQueuesStatus';
import TransactionStatus from '../../lib/factory/transactionStatus';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const transactionAdapter = sskts.adapter.transaction(connection);
    await transactionAdapter.transactionModel.remove({}).exec();
});

describe('取引サービス', () => {
    it('startIfPossible fail', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
        const transactionOption = await sskts.service.transaction.startIfPossible(expiresAt)(ownerAdapter, transactionAdapter);
        assert(transactionOption.isEmpty);
    });

    it('prepare ok', async () => {
        await sskts.service.transaction.prepare(3, 60)(sskts.adapter.transaction(connection)); // tslint:disable-line:no-magic-numbers
    });

    it('makeExpired ok', async () => {
        const transactionAdapter = sskts.adapter.transaction(connection);
        // 期限切れの取引を作成
        await sskts.service.transaction.prepare(3, -60)(transactionAdapter); // tslint:disable-line:no-magic-numbers
        await sskts.service.transaction.makeExpired()(transactionAdapter);
    });

    it('startIfPossible ok', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        await sskts.service.transaction.prepare(1, 60)(transactionAdapter); // tslint:disable-line:no-magic-numbers

        const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers
        const transactionOption = await sskts.service.transaction.startIfPossible(expiresAt)(ownerAdapter, transactionAdapter);
        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().status, sskts.factory.transactionStatus.UNDERWAY);
        assert.equal(transactionOption.get().expires_at.valueOf(), expiresAt.valueOf());
    });

    it('clean should be removed', async () => {
        // test data
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionIds: string[] = [];
        const promises = Array.from(Array(3).keys()).map(async () => { // tslint:disable-line:no-magic-numbers
            const transaction = TransactionFactory.create({
                status: TransactionStatus.READY,
                owners: [],
                expires_at: moment().add(0, 'seconds').toDate()
            });
            await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
            transactionIds.push(transaction.id);
        });
        await Promise.all(promises);

        await sskts.service.transaction.clean()(sskts.adapter.transaction(connection));

        const nubmerOfTransaction = await transactionAdapter.transactionModel.find({ _id: { $in: transactionIds } }).count().exec();

        assert.equal(nubmerOfTransaction, 0);
    });

    it('clean should not be removed', async () => {
        // test data
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionIds: string[] = [];
        const promises = Array.from(Array(3).keys()).map(async () => { // tslint:disable-line:no-magic-numbers
            const transaction = TransactionFactory.create({
                status: TransactionStatus.READY,
                owners: [],
                expires_at: moment().add(60, 'seconds').toDate() // tslint:disable-line:no-magic-numbers
            });
            await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();
            transactionIds.push(transaction.id);
        });
        await Promise.all(promises);

        await sskts.service.transaction.clean()(sskts.adapter.transaction(connection));

        const nubmerOfTransaction = await transactionAdapter.transactionModel.find({ _id: { $in: transactionIds } }).count().exec();

        assert.equal(nubmerOfTransaction, 3); // tslint:disable-line:no-magic-numbers
    });
});

describe('取引サービス 再エクスポート', () => {
    it('ok', async () => {
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: TransactionQueuesStatus.EXPORTING
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();

        await sskts.service.transaction.reexportQueues(0)(transactionAdapter); // tslint:disable-line:no-magic-numbers

        // ステータスが変更されているかどうか確認
        const retriedTransaction = await transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert.equal(retriedTransaction.get('queues_status'), TransactionQueuesStatus.UNEXPORTED);

        // テストデータ削除
        await retriedTransaction.remove();
    });
});

describe('取引サービス 強制的に開始', () => {
    it('ok', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const expiresAt = moment().add(30, 'minutes').toDate(); // tslint:disable-line:no-magic-numbers

        const transaction = await sskts.service.transaction.startForcibly(expiresAt)(ownerAdapter, transactionAdapter);
        assert.equal(transaction.expires_at.valueOf(), expiresAt.valueOf());

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('取引サービス キューエクスポート', () => {
    it('ok.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const status = TransactionStatus.CLOSED;

        // test data
        const transaction = TransactionFactory.create({
            status: status,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: TransactionQueuesStatus.UNEXPORTED
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, {
            new: true, upsert: true,
            setDefaultsOnInsert: false
        }).exec();

        await sskts.service.transaction.exportQueues(status)(queueAdapter, transactionAdapter);

        // 取引のキューエクスポートステータスを確認
        const transactionDoc = await transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert.equal(transactionDoc.get('queues_status'), TransactionQueuesStatus.EXPORTED);

        // テストデータ削除
        await transactionDoc.remove();
    });

    it('ステータスが不適切なので失敗', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const status = TransactionStatus.UNDERWAY;

        // test data
        const transaction = TransactionFactory.create({
            status: status,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: TransactionQueuesStatus.UNEXPORTED
        });
        await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, transaction, { new: true, upsert: true }).exec();

        let exportQueues: any;
        try {
            await sskts.service.transaction.exportQueues(status)(queueAdapter, transactionAdapter);
        } catch (error) {
            exportQueues = error;
        }

        assert(exportQueues instanceof Error);

        await transactionAdapter.transactionModel.findByIdAndRemove(transaction.id).exec();
    });
});

describe('取引サービス 取引IDからキュー出力する', () => {
    it('成立取引の出力成功', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '000',
                reserve_num: 123,
                tel: '09012345678'
            }),
            queues_status: TransactionQueuesStatus.UNEXPORTED
        });

        const event = AddNotificationTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:transaction-test',
                content: 'sskts-domain:test:service:transaction-test'
            })
        });

        const transactionDoc = await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id, transaction, { new: true, upsert: true }
        ).exec();
        await transactionAdapter.addEvent(event);

        await sskts.service.transaction.exportQueuesById(transaction.id)(queueAdapter, transactionAdapter);
        const queueDoc4pushNotification = await queueAdapter.model.findOne(
            {
                group: QueueGroup.PUSH_NOTIFICATION,
                'notification.id': event.notification.id
            }
        ).exec();

        assert.notEqual(queueDoc4pushNotification, null);

        await transactionDoc.remove();
        await transactionAdapter.transactionEventModel.remove({ transaction: transaction.id }).exec();
        await queueDoc4pushNotification.remove();
    });
});
