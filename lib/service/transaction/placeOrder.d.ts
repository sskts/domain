/**
 * placeOrder transaction service
 * 注文取引サービス
 * @namespace service/transaction/placeOrder
 */
import * as factory from '@motionpicture/sskts-factory';
import { MongoRepository as TaskRepository } from '../../repo/task';
import { MongoRepository as TransactionRepository } from '../../repo/transaction';
export declare type ITaskAndTransactionOperation<T> = (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => Promise<T>;
/**
 * ひとつの取引のタスクをエクスポートする
 */
export declare function exportTasks(status: factory.transactionStatusType): (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => Promise<void>;
/**
 * ID指定で取引のタスク出力
 */
export declare function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]>;
