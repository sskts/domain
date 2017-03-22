/**
 * 取引照会無効化キューファクトリー
 *
 * @namespace DisableTransactionInquiryQueueFactory
 */
import * as QueueFactory from '../../factory/queue';
import * as Transaction from '../../factory/transaction';
import ObjectId from '../objectId';
import QueueGroup from '../queueGroup';
import QueueStatus from '../queueStatus';

/**
 * 取引照会無効化キュー
 */
export interface IDisableTransactionInquiryQueue extends QueueFactory.IQueue {
    transaction: Transaction.ITransaction;
}

export function create(args: {
    id?: string,
    transaction: Transaction.ITransaction,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): IDisableTransactionInquiryQueue {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: QueueGroup.DISABLE_TRANSACTION_INQUIRY,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        transaction: args.transaction
    };
}
