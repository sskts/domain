import * as QueueFactory from '../../factory/queue';
import * as Transaction from '../../factory/transaction';
import QueueStatus from '../queueStatus';
/**
 * 取引照会無効化キュー
 * @memberof tobereplaced$
 */
export interface IDisableTransactionInquiryQueue extends QueueFactory.IQueue {
    transaction: Transaction.ITransaction;
}
/**
 *
 * @memberof tobereplaced$
 */
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
