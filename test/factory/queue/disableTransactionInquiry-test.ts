/**
 * 取引照会無効化キューファクトリーテスト
 *
 * @ignore
 */
import * as assert from 'assert';

import ArgumentError from '../../../lib/error/argument';
import ArgumentNullError from '../../../lib/error/argumentNull';
import * as DisableTransactionInquiryQueueFactory from '../../../lib/factory/queue/disableTransactionInquiry';
import QueueStatus from '../../../lib/factory/queueStatus';
import * as TransactionFactory from '../../../lib/factory/transaction';
import TransactionStatus from '../../../lib/factory/transactionStatus';

describe('取引照会無効化キューファクトリー', () => {
    it('作成できる', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.doesNotThrow(() => {
            DisableTransactionInquiryQueueFactory.create({
                transaction: transaction,
                status: QueueStatus.UNEXECUTED,
                run_at: new Date(),
                max_count_try: 10,
                last_tried_at: null,
                count_tried: 0,
                results: []
            });
        });
    });

    it('取引が空なので作成できない', () => {
        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: <any>{},
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'transaction');
                return true;
            }
        );
    });

    it('ステータスが空なので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: transaction,
                    status: <any>'',
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentNullError);
                assert.equal((<ArgumentNullError>err).argumentName, 'status');
                return true;
            }
        );
    });

    it('実行日時が不適切なので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: transaction,
                    status: QueueStatus.UNEXECUTED,
                    run_at: <any>(new Date()).toString,
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'run_at');
                return true;
            }
        );
    });

    it('最大試行回数が数字でないので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: transaction,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: <any>'10',
                    last_tried_at: null,
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'max_count_try');
                return true;
            }
        );
    });

    it('最終試行日時が不適切なので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: transaction,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: <any>{},
                    count_tried: 0,
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'last_tried_at');
                return true;
            }
        );
    });

    it('試行回数が数字でないので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: transaction,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: <any>'0',
                    results: []
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'count_tried');
                return true;
            }
        );
    });

    it('結果が配列でないので作成できない', () => {
        const transaction = TransactionFactory.create({
            status: TransactionStatus.CLOSED,
            owners: [],
            expires_at: new Date()
        });

        assert.throws(
            () => {
                DisableTransactionInquiryQueueFactory.create({
                    transaction: transaction,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(),
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: <any>{}
                });
            },
            (err: any) => {
                assert(err instanceof ArgumentError);
                assert.equal((<ArgumentError>err).argumentName, 'results');
                return true;
            }
        );
    });
});
