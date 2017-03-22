/**
 * オーソリ解除キューファクトリー
 *
 * @namespace CancelAuthorizationQueueFacroty
 */
import * as Authorization from '../../factory/authorization';
import * as Queue from '../../factory/queue';
import ObjectId from '../objectId';
import QueueGroup from '../queueGroup';
import QueueStatus from '../queueStatus';

/**
 * オーソリ解除キュー
 *
 * @param {T} authorization
 */
export interface ICancelAuthorizationQueue<T extends Authorization.IAuthorization> extends Queue.IQueue {
    authorization: T;
}

export function create<T extends Authorization.IAuthorization>(args: {
    id?: string,
    authorization: T,
    status: QueueStatus,
    run_at: Date,
    max_count_try: number,
    last_tried_at: Date | null,
    count_tried: number,
    results: string[]
}): ICancelAuthorizationQueue<T> {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: QueueGroup.CANCEL_AUTHORIZATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        authorization: args.authorization
    };
}
