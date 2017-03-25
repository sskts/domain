import * as Authorization from '../../factory/authorization';
import * as QueueFactory from '../../factory/queue';
import QueueStatus from '../queueStatus';
/**
 * 資産移動キュー
 *
 * @param {T} authorization
 */
export interface ISettleAuthorizationQueue<T extends Authorization.IAuthorization> extends QueueFactory.IQueue {
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
}): ISettleAuthorizationQueue<T>;
