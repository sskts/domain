import * as monapt from 'monapt';
import * as clientUserFactory from '../factory/clientUser';
import * as TaskFactory from '../factory/task';
import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import * as TransactionScopeFactory from '../factory/transactionScope';
import TransactionStatus from '../factory/transactionStatus';
import OwnerAdapter from '../adapter/owner';
import TaskAdapter from '../adapter/task';
import TransactionAdapter from '../adapter/transaction';
import TransactionCountAdapter from '../adapter/transactionCount';
export declare type TaskAndTransactionOperation<T> = (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export declare type OwnerAndTransactionAndTransactionCountOperation<T> = (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<T>;
export declare type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;
/**
 * 取引を開始する
 *
 * @export
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @param {string} args.clientUser クライアントユーザー
 * @param {TransactionScopeFactory.ITransactionScope} args.scope 取引スコープ
 * @param {TransactionScopeFactory.ITransactionScope} [args.ownerId] 所有者ID
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 * @memberof service/transaction
 */
export declare function start(args: {
    expiresAt: Date;
    maxCountPerUnit: number;
    clientUser: clientUserFactory.IClientUser;
    scope: TransactionScopeFactory.ITransactionScope;
    /**
     * 所有者ID
     * 会員などとして開始する場合は指定
     * 指定がない場合は匿名所有者としての開始
     */
    ownerId?: string;
}): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>;
/**
 * 匿名所有者として取引開始する
 *
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @param {string} args.state 所有者状態
 * @param {TransactionScopeFactory.ITransactionScope} args.scope 取引スコープ
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 * @memberof service/transaction
 * @deprecated use start instead
 */
export declare function startAsAnonymous(args: {
    expiresAt: Date;
    maxCountPerUnit: number;
    state: string;
    scope: TransactionScopeFactory.ITransactionScope;
}): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>;
/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction
 */
export declare function makeInquiry(key: TransactionInquiryKeyFactory.ITransactionInquiryKey): (transactionAdapter: TransactionAdapter) => Promise<monapt.Option<TransactionFactory.ITransaction>>;
/**
 * 取引を期限切れにする
 * @memberof service/transaction
 */
export declare function makeExpired(): (transactionAdapter: TransactionAdapter) => Promise<void>;
/**
 * ひとつの取引のキューをエクスポートする
 *
 * @param {TransactionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
export declare function exportQueues(status: TransactionStatus): TaskAndTransactionOperation<void>;
/**
 * ID指定で取引のキュー出力
 *
 * @param {string} id
 * @returns {TaskAndTransactionOperation<void>}
 *
 * @memberof service/transaction
 */
export declare function exportQueuesById(id: string): TaskAndTransactionOperation<TaskFactory.ITask[]>;
/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export declare function reexportQueues(intervalInMinutes: number): (transactionAdapter: TransactionAdapter) => Promise<void>;
