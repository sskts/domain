import * as Authorization from '../authorization';
import * as TransactionEventFactory from '../transactionEvent';
/**
 * オーソリ追加取引イベント
 *
 * @interface TransactionEvent
 * @extends {TransactionEvent}
 * @param {Authorization} authorization
 * @memberof tobereplaced$
 */
export interface ITransactionEvent extends TransactionEventFactory.ITransactionEvent {
    authorization: Authorization.IAuthorization;
}
/**
 *
 * @memberof tobereplaced$
 */
export declare function create(args: {
    id?: string;
    transaction: string;
    occurred_at: Date;
    authorization: Authorization.IAuthorization;
}): ITransactionEvent;
