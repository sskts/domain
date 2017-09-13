/**
 * placeOrder transaction service
 * 注文取引サービス
 * @namespace service.transaction.placeOrder
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as json2csv from 'json2csv';
import * as moment from 'moment';
// tslint:disable-next-line:no-require-imports no-var-requires
const jconv = require('jconv');

import { MongoRepository as TaskRepository } from '../../repo/task';
import { MongoRepository as TransactionRepository } from '../../repo/transaction';

const debug = createDebug('sskts-domain:service:transaction:placeOrder');

export type ITaskAndTransactionOperation<T> = (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => Promise<T>;

/**
 * ひとつの取引のタスクをエクスポートする
 */
export function exportTasks(status: factory.transactionStatusType) {
    return async (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => {
        const statusesTasksExportable = [factory.transactionStatusType.Expired, factory.transactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new factory.errors.Argument('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const transaction = await transactionRepository.transactionModel.findOneAndUpdate(
            {
                status: status,
                tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
            },
            { tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting },
            { new: true }
        ).exec()
            .then((doc) => (doc === null) ? null : <factory.transaction.placeOrder.ITransaction>doc.toObject());

        if (transaction === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = await exportTasksById(transaction.id)(
            taskRepository,
            transactionRepository
        );

        await transactionRepository.setTasksExportedById(transaction.id, tasks);
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(transactionId: string): ITaskAndTransactionOperation<factory.task.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (taskRepository: TaskRepository, transactionRepository: TransactionRepository) => {
        const transaction = await transactionRepository.findPlaceOrderById(transactionId);

        const taskAttributes: factory.task.IAttributes[] = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                taskAttributes.push(factory.task.settleSeatReservation.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                taskAttributes.push(factory.task.settleCreditCard.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                taskAttributes.push(factory.task.settleMvtk.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                taskAttributes.push(factory.task.createOrder.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                taskAttributes.push(factory.task.createOwnershipInfos.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                // notifications.forEach((notification) => {
                //     if (notification.group === NotificationGroup.EMAIL) {
                //         taskAttributes.push(SendEmailNotificationTaskFactory.create({
                //             status: factory.taskStatus.Ready,
                //             runsAt: new Date(), // todo emailのsent_atを指定
                //             remainingNumberOfTries: 10,
                //             lastTriedAt: null,
                //             numberOfTried: 0,
                //             executionResults: [],
                //             data: {
                //                 notification: <EmailNotificationFactory.INotification>notification
                //             }
                //         }));
                //     }
                // });

                break;

            // 期限切れの場合は、タスクリストを作成する
            case factory.transactionStatusType.Expired:
                taskAttributes.push(factory.task.cancelSeatReservation.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                taskAttributes.push(factory.task.cancelCreditCard.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));
                taskAttributes.push(factory.task.cancelMvtk.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(), // なるはやで実行
                    remainingNumberOfTries: 10,
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        transactionId: transaction.id
                    }
                }));

                break;

            default:
                throw new factory.errors.NotImplemented(`Transaction status "${transaction.status}" not implemented.`);
        }
        debug('taskAttributes prepared', taskAttributes);

        return await Promise.all(taskAttributes.map(async (taskAttribute) => {
            return await taskRepository.save(taskAttribute);
        }));
    };
}

/**
 * フォーマット指定でダウンロード
 * @export
 * @function
 * @memberof service.transaction.placeOrder
 * @param conditions 検索条件
 * @param format フォーマット
 */
export function download(
    conditions: {
        startFrom: Date;
        startThrough: Date;
    },
    format: 'csv'
) {
    return async (transactionRepo: TransactionRepository): Promise<string> => {
        // 取引検索
        const transactionDocs = await transactionRepo.transactionModel.find(
            {
                typeOf: factory.transactionType.PlaceOrder,
                startDate: {
                    $gte: conditions.startFrom,
                    $lte: conditions.startThrough
                }
            }
        ).exec();
        debug('transactionDocs:', transactionDocs);

        // 取引ごとに詳細を検索し、csvを作成する
        // tslint:disable-next-line:max-func-body-length
        const data = await Promise.all(transactionDocs.map(async (transactionDoc) => {
            const transaction = <factory.transaction.placeOrder.ITransaction>transactionDoc.toObject();

            if (transaction.result !== undefined) {
                const order = transaction.result.order;
                const paymentMethodCredit = order.paymentMethods.find((paymentMethod) => paymentMethod.paymentMethod === 'CreditCard');
                const mvtkDiscounts = order.discounts.filter((discount) => discount.name === 'ムビチケカード');

                return {
                    id: transaction.id,
                    status: transaction.status,
                    startDate: moment(transaction.startDate).format('YYYY-MM-DD HH:mm:ss'),
                    endDate: (transaction.endDate !== undefined) ? moment(transaction.endDate).format('YYYY-MM-DD HH:mm:ss') : '',
                    theater: transaction.seller.name,
                    reserveNum: order.orderInquiryKey.confirmationNumber,
                    name: order.customer.name,
                    email: order.customer.email,
                    telephone: order.customer.telephone,
                    price: order.price,
                    gmoOrderId: `${(paymentMethodCredit !== undefined) ? paymentMethodCredit.paymentMethodId : ''}`,
                    mvtkKnyknrNos: `${mvtkDiscounts.map((mvtkDiscount) => mvtkDiscount.discountCode).join('|')}`,
                    mvtkPrice: order.discounts.reduce((a, b) => a + b.discount, 0)
                };
            } else {
                const name = (transaction.object.customerContact !== undefined)
                    ? `${transaction.object.customerContact.familyName} ${transaction.object.customerContact.givenName}`
                    : '';

                return {
                    id: transaction.id,
                    status: transaction.status,
                    startDate: moment(transaction.startDate).format('YYYY-MM-DD HH:mm:ss'),
                    endDate: (transaction.endDate !== undefined) ? moment(transaction.endDate).format('YYYY-MM-DD HH:mm:ss') : '',
                    theater: transaction.seller.name,
                    reserveNum: '',
                    name: name,
                    email: (transaction.object.customerContact !== undefined) ? transaction.object.customerContact.email : '',
                    telephone: (transaction.object.customerContact !== undefined) ? transaction.object.customerContact.telephone : '',
                    price: '',
                    gmoOrderId: '',
                    mvtkKnyknrNos: '',
                    mvtkPrice: ''
                };
            }
        }));
        debug('data:', data);

        if (format === 'csv') {
            return await new Promise<string>((resolve) => {
                const fields = [
                    'id', 'status', 'startDate', 'endDate', 'theater', 'reserveNum',
                    'name', 'email', 'telephone',
                    'price', 'gmoOrderId', 'mvtkKnyknrNos', 'mvtkPrice'
                ];
                const fieldNames = [
                    'transaction ID', 'status', 'start at', 'end at', '劇場', 'COA reserve number',
                    'customer name', 'customer email', 'customer telephone',
                    'price', 'GMO OrderId', 'mvtk No', 'mvtk price'
                ];

                const output = json2csv({
                    data: data,
                    fields: fields,
                    fieldNames: fieldNames,
                    del: ','
                });
                debug('output:', output);

                resolve(jconv.convert(output, 'UTF8', 'SJIS'));
            });
        } else {
            throw new factory.errors.NotImplemented('specified format not implemented.');
        }
    };
}
