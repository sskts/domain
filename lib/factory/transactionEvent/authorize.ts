/**
 * オーソリ追加取引イベントファクトリー
 *
 * @namespace AuthorizeTransactionEventFactory
 */
import * as validator from 'validator';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

import * as Authorization from '../authorization';
import ObjectId from '../objectId';
import * as TransactionEventFactory from '../transactionEvent';
import TransactionEventGroup from '../transactionEventGroup';

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

export function create(args: {
    id?: string,
    transaction: string,
    occurred_at: Date,
    authorization: Authorization.IAuthorization
}): IAuthorizeTransactionEvent {
    if (validator.isEmpty(args.transaction)) throw new ArgumentNullError('transaction');
    if (validator.isEmpty(args.occurred_at.toString())) throw new ArgumentNullError('occurred_at');
    if (!(args.occurred_at instanceof Date)) throw new ArgumentError('occurred_at should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: TransactionEventGroup.AUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
