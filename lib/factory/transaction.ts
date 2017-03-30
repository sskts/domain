/**
 * 取引ファクトリー
 *
 * @namespace TransactionFactory
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

export interface ITransaction {
    id: string;
    status: TransactionStatus;
    owners: OwnerFactory.IOwner[];
    expires_at: Date;
    inquiry_key: TransactionInquiryKeyFactory.ITransactionInquiryKey | undefined;
    queues_status: TransactionQueuesStatus;
}

export function create(args: {
    id?: string;
    status: TransactionStatus;
    owners: OwnerFactory.IOwner[];
    expires_at: Date;
    inquiry_key?: TransactionInquiryKeyFactory.ITransactionInquiryKey;
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
        inquiry_key: args.inquiry_key,
        queues_status: (args.queues_status === undefined) ? TransactionQueuesStatus.UNEXPORTED : args.queues_status
    };
}
