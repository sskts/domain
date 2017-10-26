/**
 * 取引ファクトリー
 *
 * @namespace factory/transaction
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

import * as ClientUserFactory from './clientUser';
import ObjectId from './objectId';
import * as OwnerFactory from './owner';
import * as TaskFactory from './task';
import * as TransactionInquiryKeyFactory from './transactionInquiryKey';
import TransactionStatus from './transactionStatus';
import TransactionTasksExportationStatus from './transactionTasksExportationStatus';

/**
 * 取引インターフェース
 *
 * @export
 * @interface ITransaction
 * @memberof factory/transaction
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
     * 取引を進行するクライアントユーザー
     */
    client_user: ClientUserFactory.IClientUser;
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
     * タスクエクスポート日時
     */
    tasks_exported_at?: Date;
    /**
     * タスクエクスポート状態
     */
    tasks_exportation_status: TransactionTasksExportationStatus;
    /**
     * タスクリスト
     */
    tasks: TaskFactory.ITask[];
}

/**
 * 取引を作成する
 *
 * @export
 * @returns {ITransaction} 取引
 * @memberof factory/transaction
 */
export function create(args: {
    id?: string;
    status: TransactionStatus;
    owners: OwnerFactory.IOwner[];
    client_user?: ClientUserFactory.IClientUser;
    expires_at: Date;
    expired_at?: Date;
    started_at?: Date;
    closed_at?: Date;
    inquiry_key?: TransactionInquiryKeyFactory.ITransactionInquiryKey;
    tasks_exported_at?: Date;
    tasks_exportation_status?: TransactionTasksExportationStatus;
    tasks?: TaskFactory.ITask[];
}): ITransaction {
    if (_.isEmpty(args.status)) throw new ArgumentNullError('status');
    if (!_.isArray(args.owners)) throw new ArgumentError('owners', 'owner should be array');
    if (!_.isDate(args.expires_at)) throw new ArgumentError('expires_at', 'expires_at should be Date');

    const clientUser = (args.client_user === undefined)
        ? ClientUserFactory.create({ client: '', state: '', scopes: [] })
        : args.client_user;

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        status: args.status,
        owners: args.owners,
        client_user: clientUser,
        expires_at: args.expires_at,
        expired_at: args.expired_at,
        started_at: args.started_at,
        closed_at: args.closed_at,
        inquiry_key: args.inquiry_key,
        tasks_exported_at: args.tasks_exported_at,
        // tslint:disable-next-line:max-line-length
        tasks_exportation_status: (args.tasks_exportation_status === undefined) ? TransactionTasksExportationStatus.Unexported : args.tasks_exportation_status,
        tasks: (args.tasks === undefined) ? [] : args.tasks
    };
}
