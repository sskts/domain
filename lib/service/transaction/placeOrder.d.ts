/**
 * placeOrder transaction service
 * 注文取引サービス
 * @namespace service.transaction.placeOrder
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
/**
 * フォーマット指定でダウンロード
 * @export
 * @function
 * @memberof service.transaction.placeOrder
 * @param conditions 検索条件
 * @param format フォーマット
 */
export declare function download(conditions: {
    startFrom: Date;
    startThrough: Date;
}, format: 'csv'): (transactionRepo: TransactionRepository) => Promise<string>;
export declare function transaction2report(transaction: factory.transaction.placeOrder.ITransaction): {
    id: string;
    status: factory.transactionStatusType;
    startDate: string;
    endDate: string;
    name: string;
    email: string;
    telephone: string;
    eventName: string;
    eventStartDate: string;
    eventEndDate: string;
    superEventLocationBranchCode: string;
    superEventLocation: string;
    eventLocation: string;
    reservedTickets: string;
    orderNumber: string;
    confirmationNumber: number;
    paymentMethod: string;
    paymentMethodId: string;
    price: number;
    discounts: string;
    discountCodes: string;
    discountPrices: string;
} | {
    id: string;
    status: factory.transactionStatusType;
    reserveNum: string;
    startDate: string;
    endDate: string;
    name: string;
    email: string;
    telephone: string;
    eventName: string;
    eventStartDate: string;
    eventEndDate: string;
    superEventLocationBranchCode: string;
    superEventLocation: string;
    eventLocation: string;
    reservedTickets: string;
    orderNumber: string;
    confirmationNumber: string;
    paymentMethod: string;
    paymentMethodId: string;
    price: string;
    discounts: string;
    discountCodes: string;
    discountPrices: string;
};
