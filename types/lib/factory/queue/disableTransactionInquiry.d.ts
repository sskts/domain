/**
 * 取引照会無効化キューファクトリー
 *
 * @namespace DisableTransactionInquiryQueueFacroty
 */
import * as Queue from '../../factory/queue';
import * as Transaction from '../../factory/transaction';
import QueueStatus from '../queueStatus';
/**
 * 取引照会無効化キュー
 */
export interface IDisableTransactionInquiryQueue extends Queue.IQueue {
    transaction: Transaction.ITransaction;
}
export declare function create(args: {
    id?: string;
    transaction: Transaction.ITransaction;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): IDisableTransactionInquiryQueue;
