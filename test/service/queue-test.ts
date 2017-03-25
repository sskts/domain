/**
 * キューサービステスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

import * as SeatReservationAssetFactory from '../../lib/factory/asset/seatReservation';
import * as CoaSeatReservationAuthorizationFactory from '../../lib/factory/authorization/coaSeatReservation';
import * as GmoAuthorizationFactory from '../../lib/factory/authorization/gmo';
import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import * as OwnershipFactory from '../../lib/factory/ownership';
import * as DisableTransactionInquiryQueueFactory from '../../lib/factory/queue/disableTransactionInquiry';
import * as PushNotificationQueueFactory from '../../lib/factory/queue/pushNotification';
import * as SettleAuthorizationQueueFactory from '../../lib/factory/queue/settleAuthorization';
import QueueStatus from '../../lib/factory/queueStatus';
import * as TransactionFactory from '../../lib/factory/transaction';
import TransactionStatus from '../../lib/factory/transactionStatus';

import * as sskts from '../../lib/index';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const queueAdapter = sskts.adapter.queue(connection);
    await queueAdapter.model.remove({}).exec();
});

describe('queue service', () => {
    it('executeSendEmailNotification ok.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: QueueStatus.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        const status = await sskts.service.queue.executeSendEmailNotification()(queueAdapter);
        assert.equal(status, QueueStatus.EXECUTED);
    });

    it('executeSettleCOASeatReservationAuthorization fail because coa authorization is invalid.', async () => {
        const assetAdapter = sskts.adapter.asset(connection);
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = SettleAuthorizationQueueFactory.create({
            authorization: CoaSeatReservationAuthorizationFactory.create({
                price: 0,
                owner_from: 'xxx',
                owner_to: 'xxx',
                coa_tmp_reserve_num: 123,
                coa_theater_code: '000',
                coa_date_jouei: '000',
                coa_title_code: '000',
                coa_title_branch_num: '000',
                coa_time_begin: '000',
                coa_screen_code: '000',
                assets: [
                    SeatReservationAssetFactory.create({
                        id: 'xxx',
                        ownership: OwnershipFactory.create({
                            owner: 'xxx',
                            authenticated: false
                        }),
                        performance: 'xxx',
                        section: '',
                        seat_code: 'xxx',
                        ticket_code: 'xxx',
                        ticket_name_ja: '',
                        ticket_name_en: '',
                        ticket_name_kana: '',
                        std_price: 0,
                        add_price: 0,
                        dis_price: 0,
                        sale_price: 0
                    })
                ]
            }),
            status: QueueStatus.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        const status = await sskts.service.queue.executeSettleCOASeatReservationAuthorization()(assetAdapter, queueAdapter);
        assert.equal(status, QueueStatus.RUNNING);
    });

    it('executeSettleGMOAuthorization fail because gmo authorization is invalid.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = SettleAuthorizationQueueFactory.create({
            authorization: GmoAuthorizationFactory.create({
                id: 'xxx',
                price: 0,
                owner_from: 'xxx',
                owner_to: 'xxx',
                gmo_shop_id: 'xxx',
                gmo_shop_pass: 'xxx',
                gmo_order_id: 'xxx',
                gmo_amount: 0,
                gmo_access_id: 'xxx',
                gmo_access_pass: 'xxx',
                gmo_job_cd: 'xxx',
                gmo_pay_type: 'xxx'
            }),
            status: QueueStatus.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        const status = await sskts.service.queue.executeSettleGMOAuthorization()(queueAdapter);
        assert.equal(status, QueueStatus.RUNNING);
    });

    it('executeDisableTransactionInquiry fail because transaction has no inquiry key.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);

        // test data
        const queue = DisableTransactionInquiryQueueFactory.create({
            transaction: TransactionFactory.create({
                status: TransactionStatus.CLOSED,
                owners: [],
                expires_at: new Date()
            }),
            status: QueueStatus.UNEXECUTED,
            run_at: new Date(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        const status = await sskts.service.queue.executeDisableTransactionInquiry()(queueAdapter, transactionAdapter);
        assert.equal(status, QueueStatus.RUNNING);
    });

    it('retry ok.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: QueueStatus.RUNNING,
            run_at: moment().add(-10, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            max_count_try: 2,
            last_tried_at: moment().add(-10, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            count_tried: 1,
            results: ['xxx']
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        await sskts.service.queue.retry(10)(queueAdapter); // tslint:disable-line:no-magic-numbers

        // ステータスが変更されているかどうか確認
        const retriedQueue = await queueAdapter.model.findById(queue.id).exec();
        assert.equal(retriedQueue.get('status'), QueueStatus.UNEXECUTED);
    });

    it('abort ok.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: QueueStatus.RUNNING,
            run_at: moment().add(-10, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            max_count_try: 1,
            last_tried_at: moment().add(-10, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            count_tried: 1,
            results: ['xxx']
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        const queueId = await sskts.service.queue.abort(10)(queueAdapter); // tslint:disable-line:no-magic-numbers
        assert.equal(queueId, queue.id);
    });

    it('not retry because it has reached to max_count_try.', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: QueueStatus.RUNNING,
            run_at: moment().add(-10, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            max_count_try: 1,
            last_tried_at: moment().add(-10, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            count_tried: 1,
            results: ['xxx']
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        await sskts.service.queue.retry(10)(queueAdapter); // tslint:disable-line:no-magic-numbers

        // ステータスが変更されているかどうか確認
        const retriedQueue = await queueAdapter.model.findById(queue.id).exec();
        assert.equal(retriedQueue.get('status'), QueueStatus.RUNNING);
    });
});
