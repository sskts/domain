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
 * 確定取引についてメールを送信する
 * @export
 * @function
 * @memberof service.transaction.placeOrder
 * @param transactionId 取引ID
 * @param emailMessageAttributes Eメールメッセージ属性
 */
export declare function sendEmail(transactionId: string, emailMessageAttributes: factory.creativeWork.message.email.IAttributes): ITaskAndTransactionOperation<factory.task.sendEmailNotification.ITask>;
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
/**
 * 取引レポートインターフェース
 * @export
 * @interface
 * @memberof service.transaction.placeOrder
 */
export interface ITransactionReport {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    customer: {
        name: string;
        email: string;
        telephone: string;
        memberOf?: {
            membershipNumber: string;
        };
    };
    eventName: string;
    eventStartDate: string;
    eventEndDate: string;
    superEventLocationBranchCode: string;
    superEventLocation: string;
    eventLocation: string;
    reservedTickets: string;
    orderNumber: string;
    confirmationNumber: string;
    price: string;
    paymentMethod: string[];
    paymentMethodId: string[];
    discounts: string[];
    discountCodes: string[];
    discountPrices: string[];
}
export declare function transaction2report(transaction: factory.transaction.placeOrder.ITransaction): ITransactionReport;
