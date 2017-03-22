/**
 * オーソリ削除取引イベントファクトリー
 *
 * @namespace UnauthorizeTransactionEventFactory
 */
import * as Authorization from '../authorization';
import ObjectId from '../objectId';
import * as TransactionEventFactory from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

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

export function create(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    authorization: Authorization.IAuthorization
}): IUnauthorizeTransactionEvent {
    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: TransactionEventGroup.UNAUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
