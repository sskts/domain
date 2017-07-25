import * as TaskFactory from './task';
import TransactionStatusType from './transactionStatusType';
import TransactionTasksExportationStatus from './transactionTasksExportationStatus';
import TransactionType from './transactionType';
export interface ITransaction {
    id: string;
    typeOf: TransactionType;
    status: TransactionStatusType;
    agent: any;
    result?: any;
    error?: any;
    object?: any;
    expires: Date;
    startDate?: Date;
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
export declare function create(args: {
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
}): ITransaction;
