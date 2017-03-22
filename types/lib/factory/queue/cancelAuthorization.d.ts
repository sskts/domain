/**
 * オーソリ解除キューファクトリー
 *
 * @namespace CancelAuthorizationQueueFacroty
 */
import * as Authorization from '../../factory/authorization';
import * as Queue from '../../factory/queue';
import QueueStatus from '../queueStatus';
/**
 * オーソリ解除キュー
 *
 * @param {T} authorization
 */
export interface ICancelAuthorizationQueue<T extends Authorization.IAuthorization> extends Queue.IQueue {
    authorization: T;
}
export declare function create<T extends Authorization.IAuthorization>(args: {
    id?: string;
    authorization: T;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}): ICancelAuthorizationQueue<T>;
