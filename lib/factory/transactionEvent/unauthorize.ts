/**
 * オーソリ削除取引イベントファクトリー
 *
 * @namespace UnauthorizeTransactionEventFactory
 */
import * as validator from 'validator';

import ArgumentError from '../../error/argument';
import ArgumentNullError from '../../error/argumentNull';

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
    if (validator.isEmpty(args.occurred_at.toString())) throw new ArgumentNullError('occurred_at');
    if (!(args.occurred_at instanceof Date)) throw new ArgumentError('occurred_at should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        group: TransactionEventGroup.UNAUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
