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
import TransactionAdapter from '../../lib/adapter/transaction';

import * as ReportService from '../../lib/service/report';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const gmoNotificationAdapter = new GMONotificationAdapter(connection);
    await gmoNotificationAdapter.gmoNotificationModel.remove({}).exec();
});

describe('レポートサービス 取引状態', () => {
    it('ok', async () => {
        await ReportService.transactionStatuses()(
            new QueueAdapter(connection),
            new TransactionAdapter(connection)
        );
    });
});

describe('レポートサービス GMO実売上検索', () => {
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
