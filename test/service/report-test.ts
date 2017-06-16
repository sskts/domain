/**
 * レポートサービステスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import GMONotificationAdapter from '../../lib/adapter/gmoNotification';
import QueueAdapter from '../../lib/adapter/queue';
import TelemetryAdapter from '../../lib/adapter/telemetry';
import TransactionAdapter from '../../lib/adapter/transaction';

import * as GMOAuthorizationFactory from '../../lib/factory/authorization/gmo';
import * as TransactionFactory from '../../lib/factory/transaction';
import * as AuthorizeTransactionEventFactory from '../../lib/factory/transactionEvent/authorize';
import * as TransactionInquiryKeyFactory from '../../lib/factory/transactionInquiryKey';
import TransactionStatus from '../../lib/factory/transactionStatus';

import * as ReportService from '../../lib/service/report';

describe('レポートサービス 測定データ作成', () => {
    let connection: mongoose.Connection;
    beforeEach(async () => {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);

        // 全て削除
        const telemetryAdapter = new TelemetryAdapter(connection);
        await telemetryAdapter.telemetryModel.remove({}).exec();
    });

    it('ok', async () => {
        await ReportService.createTelemetry()(
            new QueueAdapter(connection),
            new TelemetryAdapter(connection),
            new TransactionAdapter(connection)
        );
    });
});

describe('レポートサービス 取引状態', () => {
    let connection: mongoose.Connection;
    before(async () => {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    });

    it('ok', async () => {
        await ReportService.transactionStatuses()(
            new QueueAdapter(connection),
            new TransactionAdapter(connection)
        );
    });
});

describe('レポートサービス GMO実売上検索', () => {
    let connection: mongoose.Connection;
    before(async () => {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const gmoNotificationAdapter = new GMONotificationAdapter(connection);
        await gmoNotificationAdapter.gmoNotificationModel.remove({}).exec();
    });

    it('ok', async () => {
        // tslint:disable-next-line:no-magic-numbers
        const dateFrom = moment().add(-10, 'minutes').toDate();
        const dateTo = moment().toDate();

        const gmoNotificationAdapter = new GMONotificationAdapter(connection);

        const notifications = [
            {
                shop_id: 'tshop00026096',
                access_id: 'c2ab15af0e7459291913adede0657f12',
                order_id: '201704151180000151900',
                status: 'SALES',
                job_cd: 'SALES',
                amount: '2000',
                tax: '0',
                currency: 'JPN',
                forward: '2a99662',
                method: '1',
                pay_times: '',
                tran_id: '1704152300111111111111877098',
                approve: '2980559',
                tran_date: moment(dateFrom).format('YYYYMMDDHHmmss'),
                err_code: '',
                err_info: '',
                pay_type: '0'
            },
            {
                shop_id: 'tshop00026096',
                access_id: 'c2ab15af0e7459291913adede0657f12',
                order_id: '201704151180000151900',
                status: 'SALES',
                job_cd: 'SALES',
                amount: '2000',
                tax: '0',
                currency: 'JPN',
                forward: '2a99662',
                method: '1',
                pay_times: '',
                tran_id: '1704152300111111111111877098',
                approve: '2980559',
                tran_date: moment(dateFrom).add(-1, 'seconds').format('YYYYMMDDHHmmss'),
                err_code: '',
                err_info: '',
                pay_type: '0'
            }
        ];
        const notificationDocs = await gmoNotificationAdapter.gmoNotificationModel.create(notifications);

        const sales = await ReportService.searchGMOSales(dateFrom, dateTo)(
            gmoNotificationAdapter
        );
        assert.equal(sales.length, 1);

        const promises = notificationDocs.map(async (notificationDoc) => {
            await notificationDoc.remove();
        });
        await Promise.all(promises);
    });
});

describe('レポートサービス GMO実売上診察', () => {
    let connection: mongoose.Connection;
    before(async () => {
        connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const gmoNotificationAdapter = new GMONotificationAdapter(connection);
        // const transactionAdapter = new TransactionAdapter(connection);
        await gmoNotificationAdapter.gmoNotificationModel.remove({}).exec();
        // await transactionAdapter.transactionModel.remove({}).exec();
        // await transactionAdapter.transactionEventModel.remove({}).exec();
    });

    it('ok', async () => {
        const reserveNum = 123;
        const shopId = '123';
        const orderId = '201704201180000012300';
        const accessId = '12345';
        const amount = 12345;

        const transactionAdapter = new TransactionAdapter(connection);

        // テスト取引作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            // tslint:disable-next-line:no-magic-numbers
            expires_at: moment().add(15, 'minutes').toDate(),
            started_at: moment().toDate(),
            closed_at: moment().toDate(),
            inquiry_key: TransactionInquiryKeyFactory.create({
                theater_code: '118',
                reserve_num: reserveNum,
                tel: '09012345678'
            })
        });
        // テスト取引イベント作成
        const transactionEvent = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: moment().toDate(),
            authorization: GMOAuthorizationFactory.create({
                price: amount,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: shopId,
                gmo_shop_pass: 'xxx',
                gmo_order_id: orderId,
                gmo_amount: amount,
                gmo_access_id: accessId,
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'AUTH',
                gmo_pay_type: '0'
            })
        });
        const transactionDoc = await transactionAdapter.transactionModel.findByIdAndUpdate(
            transaction.id,
            transaction,
            { new: true, upsert: true }
        ).exec();
        const transactionEventDoc = await transactionAdapter.transactionEventModel.findByIdAndUpdate(
            transactionEvent.id,
            transactionEvent,
            { new: true, upsert: true }
        ).exec();

        const notification = {
            shop_id: shopId,
            access_id: accessId,
            order_id: orderId,
            status: 'SALES',
            job_cd: 'SALES',
            amount: amount.toString(),
            tax: '0',
            currency: 'JPN',
            forward: 'xxx',
            method: '1',
            pay_times: '',
            tran_id: 'xxx',
            approve: 'xxx',
            tran_date: 'xxx',
            err_code: '',
            err_info: '',
            pay_type: '0'
        };

        await ReportService.examineGMOSales(notification)(transactionAdapter);

        await transactionDoc.remove();
        await transactionEventDoc.remove();
    });
});
