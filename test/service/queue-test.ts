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
import * as MvtkAuthorizationFactory from '../../lib/factory/authorization/mvtk';
import AuthorizationGroup from '../../lib/factory/authorizationGroup';
import * as EmailNotificationFactory from '../../lib/factory/notification/email';
import * as OwnershipFactory from '../../lib/factory/ownership';
import * as CancelAuthorizationQueueFactory from '../../lib/factory/queue/cancelAuthorization';
import * as DisableTransactionInquiryQueueFactory from '../../lib/factory/queue/disableTransactionInquiry';
import * as PushNotificationQueueFactory from '../../lib/factory/queue/pushNotification';
import * as SettleAuthorizationQueueFactory from '../../lib/factory/queue/settleAuthorization';
import QueueGroup from '../../lib/factory/queueGroup';
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

describe('キューサービス', () => {
    it('Eメール送信キューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeSendEmailNotification()(queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.PUSH_NOTIFICATION
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('COA仮予約キャンセルキューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeCancelCOASeatReservationAuthorization()(queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.CANCEL_AUTHORIZATION
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('GMO仮売上取消キューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeCancelGMOAuthorization()(queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.CANCEL_AUTHORIZATION
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('取引照会無効化キューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        await sskts.service.queue.executeDisableTransactionInquiry()(queueAdapter, transactionAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.DISABLE_TRANSACTION_INQUIRY
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('COA本予約キューがなければ何もしない', async () => {
        const assetAdapter = sskts.adapter.asset(connection);
        const ownerAdapter = sskts.adapter.owner(connection);
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeSettleCOASeatReservationAuthorization()(assetAdapter, ownerAdapter, queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.SETTLE_AUTHORIZATION
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('GMO実売上キューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeSettleGMOAuthorization()(queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.SETTLE_AUTHORIZATION
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('ムビチケ資産移動キューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeSettleMvtkAuthorization()(queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.SETTLE_AUTHORIZATION
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('実行日時の早さよりも試行回数の少なさを優先する', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        // 20分前
        const queue = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: QueueStatus.UNEXECUTED,
            // tslint:disable-next-line:no-magic-numbers
            run_at: moment().add(-20, 'minutes').toDate(),
            max_count_try: 1,
            last_tried_at: moment().toDate(),
            count_tried: 1,
            results: []
        });
        // 10分前(実行日時はこちらの方が遅い)
        const queue2 = PushNotificationQueueFactory.create({
            notification: EmailNotificationFactory.create({
                from: 'noreply@example.net',
                to: process.env.SSKTS_DEVELOPER_EMAIL,
                subject: 'sskts-domain:test:service:queue-test',
                content: 'sskts-domain:test:service:queue-test'
            }),
            status: QueueStatus.UNEXECUTED,
            // tslint:disable-next-line:no-magic-numbers
            run_at: moment().add(-10, 'minutes').toDate(),
            max_count_try: 1,
            last_tried_at: null,
            count_tried: 0,
            results: []
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();
        await queueAdapter.model.findByIdAndUpdate(queue2.id, queue2, { new: true, upsert: true }).exec();

        await sskts.service.queue.executeSendEmailNotification()(queueAdapter);

        // 試行回数の少ない方が優先されるはず
        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        const queue2Doc = await queueAdapter.model.findById(queue2.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.UNEXECUTED);
        assert.equal(queue2Doc.get('status'), QueueStatus.EXECUTED);

        // テストデータ削除
        queueDoc.remove();
        queue2Doc.remove();
    });

    it('Eメール通知成功', async () => {
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

        await sskts.service.queue.executeSendEmailNotification()(queueAdapter);

        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.EXECUTED);

        // テストデータ削除
        queueDoc.remove();
    });

    it('COA仮予約承認が不適切なので資産移動失敗', async () => {
        const assetAdapter = sskts.adapter.asset(connection);
        const ownerAdapter = sskts.adapter.owner(connection);
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = SettleAuthorizationQueueFactory.create({
            authorization: CoaSeatReservationAuthorizationFactory.create({
                price: 123,
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
                        ticket_name_ja: 'xxx',
                        ticket_name_en: '',
                        ticket_name_kana: '',
                        std_price: 0,
                        add_price: 0,
                        dis_price: 0,
                        sale_price: 0,
                        mvtk_app_price: 0,
                        add_glasses: 0
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

        await sskts.service.queue.executeSettleCOASeatReservationAuthorization()(assetAdapter, ownerAdapter, queueAdapter);

        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.RUNNING);

        // テストデータ削除
        queueDoc.remove();
    });

    it('GMOオーソリが不適切なので実売上失敗', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = SettleAuthorizationQueueFactory.create({
            authorization: GmoAuthorizationFactory.create({
                id: 'xxx',
                price: 123,
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

        await sskts.service.queue.executeSettleGMOAuthorization()(queueAdapter);

        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.RUNNING);

        // テストデータ削除
        queueDoc.remove();
    });

    it('照会キーがないので取引照会無効化失敗', async () => {
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

        await sskts.service.queue.executeDisableTransactionInquiry()(queueAdapter, transactionAdapter);

        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.RUNNING);

        // テストデータ削除
        queueDoc.remove();
    });
});

describe('キューサービス 中止', () => {
    it('最大試行回数に達すると中止する', async () => {
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

        await sskts.service.queue.abort(10)(queueAdapter); // tslint:disable-line:no-magic-numbers

        // ステータスが変更されているかどうか確認
        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.ABORTED);

        // テストデータ削除
        queueDoc.remove();
    });
});

describe('キューサービス リトライ', () => {
    it('最大試行回数に達していなければリトライする', async () => {
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
        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.UNEXECUTED);

        // テストデータ削除
        queueDoc.remove();
    });

    it('最大試行回数に達するとリトライしない', async () => {
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
        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.RUNNING);

        // テストデータ削除
        queueDoc.remove();
    });

    it('最終試行日時から指定インターバル経過していなければリトライしない', async () => {
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
            last_tried_at: moment().add(-9, 'minutes').toDate(), // tslint:disable-line:no-magic-numbers
            count_tried: 1,
            results: ['xxx']
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        // 9分前に最終試行に対して、10分のインターバルでリトライ
        await sskts.service.queue.retry(10)(queueAdapter); // tslint:disable-line:no-magic-numbers

        // ステータスが変更されているかどうか確認
        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.RUNNING);

        // テストデータ削除
        queueDoc.remove();
    });
});

describe('キューサービス ムビチケ着券取消キュー実行', () => {
    it('ムビチケ着券取消キューがなければ何もしない', async () => {
        const queueAdapter = sskts.adapter.queue(connection);
        await sskts.service.queue.executeCancelMvtkAuthorization()(queueAdapter);

        // 実行済みのキューはないはず
        const queueDoc = await queueAdapter.model.findOne({
            status: QueueStatus.EXECUTED,
            group: QueueGroup.CANCEL_AUTHORIZATION,
            'authorization.group': AuthorizationGroup.MVTK
        }).exec();
        assert.equal(queueDoc, null);
    });

    it('OK', async () => {
        const queueAdapter = sskts.adapter.queue(connection);

        // test data
        const queue = CancelAuthorizationQueueFactory.create({
            authorization: MvtkAuthorizationFactory.create({
                price: 1234,
                owner_from: 'xxx',
                owner_to: 'xxx',
                kgygish_cd: 'xxx',
                yyk_dvc_typ: 'xxx',
                trksh_flg: 'xxx',
                kgygish_sstm_zskyyk_no: 'xxx',
                kgygish_usr_zskyyk_no: 'xxx',
                jei_dt: 'xxx',
                kij_ymd: 'xxx',
                st_cd: 'xxx',
                scren_cd: 'xxx',
                knyknr_no_info: [{
                    knyknr_no: 'xxx',
                    pin_cd: 'xxx',
                    knsh_info: [{
                        knsh_typ: 'xxx',
                        mi_num: 'xxx'
                    }]
                }],
                zsk_info: [{
                    zsk_cd: 'xxx'
                }],
                skhn_cd: 'xxx'
            }),
            status: QueueStatus.UNEXECUTED,
            run_at: moment().toDate(),
            max_count_try: 0,
            last_tried_at: null,
            count_tried: 1,
            results: []
        });
        await queueAdapter.model.findByIdAndUpdate(queue.id, queue, { new: true, upsert: true }).exec();

        await sskts.service.queue.executeCancelMvtkAuthorization()(queueAdapter);

        // ステータスが変更されているかどうか確認
        const queueDoc = await queueAdapter.model.findById(queue.id, 'status').exec();
        assert.equal(queueDoc.get('status'), QueueStatus.EXECUTED);

        // テストデータ削除
        queueDoc.remove();
    });
});
