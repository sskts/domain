/**
 * オーソリ追加取引イベントファクトリー
 *
 * @namespace AuthorizeTransactionEventFactory
 */
import * as Authorization from '../authorization';
import * as TransactionEventFactory from '../transactionEvent';
/**
 * オーソリ追加取引イベント
 *
 * @interface AuthorizeTransactionEvent
 * @extends {TransactionEvent}
 * @param {Authorization} authorization
 */
export interface IAuthorizeTransactionEvent extends TransactionEventFactory.ITransactionEvent {
    authorization: Authorization.IAuthorization;
}
export declare function create(args: {
    id?: string;
    transaction: string;
    occurred_at: Date;
    authorization: Authorization.IAuthorization;
}): IAuthorizeTransactionEvent;
