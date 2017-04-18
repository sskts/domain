/**
 * 取引ファクトリー
 *
 * @namespace factory/transaction
 *
 * @param {string} id
 * @param {TransactionStatus} status
 * @param {Owner[]} owners
 * @param {Date} expires_at
 * @param {string} inquiry_theater
 * @param {string} inquiry_id
 * @param {string} inquiry_pass
 * @param {TransactionQueuesStatus} queues_status
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

import ObjectId from './objectId';
import * as OwnerFactory from './owner';
import * as TransactionInquiryKeyFactory from './transactionInquiryKey';
import TransactionQueuesStatus from './transactionQueuesStatus';
import TransactionStatus from './transactionStatus';

/**
 *
 * @interface ITransaction
 * @memberof tobereplaced$
 */
export interface ITransaction {
    id: string;
    /**
     * 取引状態
     */
    status: TransactionStatus;
    /**
     * 取引に参加している所有者リスト
     */
    owners: OwnerFactory.IOwner[];
    /**
     * 期限切れ予定日時
     */
    expires_at: Date;
    /**
     * 期限切れ日時
     */
    expired_at?: Date;
    /**
     * 開始日時
     */
    started_at?: Date;
    /**
     * 成立日時
     */
    closed_at?: Date;
    /**
     * 照会キー
     */
    inquiry_key?: TransactionInquiryKeyFactory.ITransactionInquiryKey;
    /**
     * キューエクスポート日時
     */
    queues_exported_at?: Date;
    /**
     * キューエクスポート状態
     */
    queues_status: TransactionQueuesStatus;
}

/**
 *
 * @returns {ITransaction}
 * @memberof tobereplaced$
 */
export function create(args: {
    id?: string;
    status: TransactionStatus;
    owners: OwnerFactory.IOwner[];
    expires_at: Date;
    expired_at?: Date;
    started_at?: Date;
    closed_at?: Date;
    inquiry_key?: TransactionInquiryKeyFactory.ITransactionInquiryKey;
    queues_exported_at?: Date;
    queues_status?: TransactionQueuesStatus;
}): ITransaction {
    if (_.isEmpty(args.status)) throw new ArgumentNullError('status');
    if (!_.isArray(args.owners)) throw new ArgumentError('owners', 'owner should be array');
    if (!_.isDate(args.expires_at)) throw new ArgumentError('expires_at', 'expires_at should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        status: args.status,
        owners: args.owners,
        expires_at: args.expires_at,
        expired_at: args.expired_at,
        started_at: args.started_at,
        closed_at: args.closed_at,
        inquiry_key: args.inquiry_key,
        queues_exported_at: args.queues_exported_at,
        queues_status: (args.queues_status === undefined) ? TransactionQueuesStatus.UNEXPORTED : args.queues_status
    };
}
