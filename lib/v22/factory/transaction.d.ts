import * as ClientUserFactory from './clientUser';
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
export declare function create(args: {
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
}): ITransaction;
