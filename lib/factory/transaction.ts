/**
 * 取引ファクトリー
 *
 * @namespace factory/transaction
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

import ObjectId from './objectId';
import * as TaskFactory from './task';
import TransactionStatusType from './transactionStatusType';
import TransactionTasksExportationStatus from './transactionTasksExportationStatus';
import TransactionType from './transactionType';

/**
 * 取引インターフェース
 */
export interface ITransaction {
    /**
     * 取引ID
     * MongoDBのオブジェクトID
     */
    id: string;
    /**
     * 取引タイプ
     */
    typeOf: TransactionType;
    /**
     * 取引状態
     */
    status: TransactionStatusType;
    /**
     * 取引主体
     */
    agent: any;
    /**
     * 取引結果
     */
    result?: any;
    /**
     * 取引エラー
     */
    error?: any;
    /**
     * 取引対象
     */
    object?: any;
    /**
     * 取引進行期限
     */
    expires: Date;
    /**
     * 取引開始日時
     */
    startDate?: Date;
    /**
     * 取引終了日時
     */
    endDate?: Date;
    /**
     * タスクエクスポート日時
     */
    tasksExportedAt?: Date;
    /**
     * タスクエクスポート状態
     */
    tasksExportationStatus: TransactionTasksExportationStatus;
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
    typeOf: TransactionType;
    status: TransactionStatusType;
    agent: any;
    result?: any;
    error?: any;
    object?: any;
    expires: Date;
    startDate?: Date;
    endDate?: Date;
    tasksExportedAt?: Date;
    tasksExportationStatus?: TransactionTasksExportationStatus;
    tasks?: TaskFactory.ITask[];
}): ITransaction {
    if (_.isEmpty(args.status)) throw new ArgumentNullError('status');
    if (!_.isDate(args.expires)) throw new ArgumentError('expires', 'expires should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        typeOf: args.typeOf,
        status: args.status,
        agent: args.agent,
        result: args.result,
        error: args.error,
        object: args.object,
        expires: args.expires,
        startDate: args.startDate,
        endDate: args.endDate,
        tasksExportedAt: args.tasksExportedAt,
        // tslint:disable-next-line:max-line-length
        tasksExportationStatus: (args.tasksExportationStatus === undefined) ? TransactionTasksExportationStatus.Unexported : args.tasksExportationStatus,
        tasks: (args.tasks === undefined) ? [] : args.tasks
    };
}
