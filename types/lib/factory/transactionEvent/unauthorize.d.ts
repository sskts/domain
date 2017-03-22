/**
 * オーソリ削除取引イベントファクトリー
 *
 * @namespace UnauthorizeTransactionEventFactory
 */
import * as Authorization from '../authorization';
import * as TransactionEventFactory from '../transactionEvent';
/**
 * オーソリ削除取引イベント
 *
 * @interface Unauthorize
 * @extends {TransactionEvent}
 * @param {Authorization} authorization
 */
export interface IUnauthorizeTransactionEvent extends TransactionEventFactory.ITransactionEvent {
    authorization: Authorization.IAuthorization;
}
export declare function create(args: {
    id?: string;
    transaction: string;
    occurred_at: Date;
    authorization: Authorization.IAuthorization;
}): IUnauthorizeTransactionEvent;
