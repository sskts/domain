/**
 * 取引サービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as redis from 'redis';
import * as sskts from '../../lib/index';

import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import OwnerGroup from '../../lib/factory/ownerGroup';
import QueueGroup from '../../lib/factory/queueGroup';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AddNotificationTransactionEventFactory from '../../lib/factory/transactionEvent/addNotification';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';
import TransactionQueuesStatus from '../../lib/factory/transactionQueuesStatus';
import * as TransactionScopeFactory from '../../lib/factory/transactionScope';
import TransactionStatus from '../../lib/factory/transactionStatus';

import TransactionCountAdapter from '../../lib/adapter/transactionCount';

const TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS = 60;
let TEST_START_TRANSACTION_AS_ANONYMOUS_ARGS: any;
const TEST_PROMOTER_OWNER = {
    name: {
        ja: '佐々木興業株式会社',
        en: 'Cinema Sunshine Co., Ltd.'
    }
};

let redisClient: redis.RedisClient;
let connection: mongoose.Connection;

before(async () => {
    if (typeof process.env.TEST_REDIS_HOST !== 'string') {
        throw new Error('environment variable TEST_REDIS_HOST required');
    }

    if (typeof process.env.TEST_REDIS_PORT !== 'string') {
        throw new Error('environment variable TEST_REDIS_PORT required');
    }

    if (typeof process.env.TEST_REDIS_KEY !== 'string') {
        throw new Error('environment variable TEST_REDIS_KEY required');
    }

    redisClient = redis.createClient({
        host: process.env.TEST_REDIS_HOST,
        port: process.env.TEST_REDIS_PORT,
        password: process.env.TEST_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const ownerAdapter = sskts.adapter.owner(connection);
    const transactionAdapter = sskts.adapter.transaction(connection);
    await ownerAdapter.model.remove({ group: OwnerGroup.ANONYMOUS }).exec();
    await transactionAdapter.transactionModel.remove({}).exec();

    // tslint:disable-next-line:no-magic-numbers
    const expiresAt = moment().add(30, 'minutes').toDate();
    const dateNow = moment();
    const readyFrom = moment.unix(dateNow.unix() - dateNow.unix() % TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS);
    const readyUntil = moment(readyFrom).add(TEST_UNIT_OF_COUNT_TRANSACTIONS_IN_SECONDS, 'seconds');
    const scope = TransactionScopeFactory.create({
        ready_from: readyFrom.toDate(),
        ready_until: readyUntil.toDate()
    });
    TEST_START_TRANSACTION_AS_ANONYMOUS_ARGS = {
        expiresAt: expiresAt,
        maxCountPerUnit: 999,
        state: 'xxx',
        scope: scope
    };
});

describe('取引サービス 匿名所有者として取引開始する', () => {
    beforeEach(async () => {
        // 興行所有者を準備
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findOneAndUpdate(
            { group: OwnerGroup.PROMOTER },
            TEST_PROMOTER_OWNER,
            { upsert: true }
        ).exec();
    });

    it('取引数制限を越えているため開始できない', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionCountAdapter = new TransactionCountAdapter(redisClient);

        const args = { ...TEST_START_TRANSACTION_AS_ANONYMOUS_ARGS, ...{ maxCountPerUnit: 0 } };
        const transactionOption = await sskts.service.transaction.startAsAnonymous(args)(
            ownerAdapter, transactionAdapter, transactionCountAdapter
        );
        assert(transactionOption.isEmpty);
    });

    it('興行所有者が存在しなければ開始できない', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionCountAdapter = new TransactionCountAdapter(redisClient);

        await ownerAdapter.model.remove({ group: OwnerGroup.PROMOTER }).exec();

        const startError = await sskts.service.transaction.startAsAnonymous(TEST_START_TRANSACTION_AS_ANONYMOUS_ARGS)(
            ownerAdapter, transactionAdapter, transactionCountAdapter
        ).catch((error) => {
            return error;
        });
        assert(startError instanceof Error);
    });

    it('開始できる', async () => {
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        const transactionCountAdapter = new TransactionCountAdapter(redisClient);

        const transactionOption = await sskts.service.transaction.startAsAnonymous(TEST_START_TRANSACTION_AS_ANONYMOUS_ARGS)(
            ownerAdapter, transactionAdapter, transactionCountAdapter
        );

        assert(transactionOption.isDefined);
        assert.equal(transactionOption.get().status, sskts.factory.transactionStatus.UNDERWAY);
        assert.equal(transactionOption.get().expires_at.valueOf(), TEST_START_TRANSACTION_AS_ANONYMOUS_ARGS.expiresAt.valueOf());
        assert.equal(transactionOption.get().queues_status, sskts.factory.transactionQueuesStatus.UNEXPORTED);
    });
});

describe('取引サービス', () => {
    it('prepare ok', async () => {
        await sskts.service.transaction.prepare(3, 60)(sskts.adapter.transaction(connection)); // tslint:disable-line:no-magic-numbers
    });

    it('makeExpired ok', async () => {
        const transactionAdapter = sskts.adapter.transaction(connection);
        // 期限切れの取引を作成
        await sskts.service.transaction.prepare(3, -60)(transactionAdapter); // tslint:disable-line:no-magic-numbers
        await sskts.service.transaction.makeExpired()(transactionAdapter);
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
        const retriedTransaction = <mongoose.Document>await transactionAdapter.transactionModel.findById(transaction.id).exec();
        assert.equal(retriedTransaction.get('queues_status'), TransactionQueuesStatus.UNEXPORTED);

        // テストデータ削除
        await retriedTransaction.remove();
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
        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findById(transaction.id).exec();
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

        const transactionDoc = <mongoose.Document>await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id, transaction, { new: true, upsert: true }
        ).exec();
        await transactionAdapter.addEvent(event);

        await sskts.service.transaction.exportQueuesById(transaction.id)(queueAdapter, transactionAdapter);
        const queueDoc4pushNotification = <mongoose.Document>await queueAdapter.model.findOne(
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
