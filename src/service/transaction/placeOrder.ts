/**
 * placeOrder transaction service
 * 注文取引サービス
 * @namespace service.transaction.placeOrder
 */

import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as json2csv from 'json2csv';
// tslint:disable-next-line:no-require-imports no-var-requires
// const jconv = require('jconv');

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
        const transactions = await transactionRepo.searchPlaceOrder(conditions);
        debug('transactions:', transactions);

        // 取引ごとに詳細を検索し、csvを作成する
        const data = await Promise.all(transactions.map(async (transaction) => transaction2report(transaction)));
        debug('data:', data);

        if (format === 'csv') {
            return await new Promise<string>((resolve) => {
                const fields = Object.keys(data[0]);
                const fieldNames = Object.keys(data[0]);
                const output = json2csv(<any>{
                    data: data,
                    fields: fields,
                    fieldNames: fieldNames,
                    del: ',',
                    newLine: '\n',
                    preserveNewLinesInValues: true
                });
                debug('output:', output);

                resolve(output);
                // resolve(jconv.convert(output, 'UTF8', 'SJIS'));
            });
        } else {
            throw new factory.errors.NotImplemented('specified format not implemented.');
        }
    };
}

export function transaction2report(transaction: factory.transaction.placeOrder.ITransaction) {
    if (transaction.result !== undefined) {
        const order = transaction.result.order;
        const orderItems = order.acceptedOffers;
        const screeningEvent = orderItems[0].itemOffered.reservationFor;
        const ticketsStr = orderItems.map(
            // tslint:disable-next-line:max-line-length
            (orderItem) => `${orderItem.itemOffered.reservedTicket.ticketedSeat.seatNumber} ${orderItem.itemOffered.reservedTicket.coaTicketInfo.ticketName} ￥${orderItem.itemOffered.reservedTicket.coaTicketInfo.salePrice}`
        ).join('\n');

        return {
            id: transaction.id,
            status: transaction.status,
            startDate: (transaction.startDate !== undefined) ? transaction.startDate.toISOString() : '',
            endDate: (transaction.endDate !== undefined) ? transaction.endDate.toISOString() : '',
            name: order.customer.name,
            email: order.customer.email,
            telephone: order.customer.telephone,
            eventName: screeningEvent.superEvent.workPerformed.name,
            eventStartDate: screeningEvent.startDate.toISOString(),
            eventEndDate: screeningEvent.endDate.toISOString(),
            superEventLocationBranchCode: `${screeningEvent.superEvent.location.branchCode}`,
            superEventLocation: screeningEvent.superEvent.location.name.ja,
            eventLocation: screeningEvent.location.name.ja,
            reservedTickets: ticketsStr,
            orderNumber: order.orderNumber,
            confirmationNumber: order.confirmationNumber,
            paymentMethod: order.paymentMethods.map((method) => method.name).join('\n'),
            paymentMethodId: order.paymentMethods.map((method) => method.paymentMethodId).join('\n'),
            price: order.price,
            discounts: order.discounts.map((discount) => discount.name).join('\n'),
            discountCodes: order.discounts.map((discount) => discount.discountCode).join('\n'),
            discountPrices: order.discounts.map((discount) => `${discount.discount} ${discount.discountCurrency}`).join('\n')
        };
    } else {
        const customerContact = transaction.object.customerContact;

        return {
            id: transaction.id,
            status: transaction.status,
            reserveNum: '',
            startDate: (transaction.startDate !== undefined) ? transaction.startDate.toISOString() : '',
            endDate: (transaction.endDate !== undefined) ? transaction.endDate.toISOString() : '',
            name: (customerContact !== undefined) ? `${customerContact.familyName} ${customerContact.givenName}` : '',
            email: (customerContact !== undefined) ? customerContact.email : '',
            telephone: (customerContact !== undefined) ? customerContact.telephone : '',
            eventName: '',
            eventStartDate: '',
            eventEndDate: '',
            superEventLocationBranchCode: '',
            superEventLocation: '',
            eventLocation: '',
            reservedTickets: '',
            orderNumber: '',
            confirmationNumber: '',
            paymentMethod: '',
            paymentMethodId: '',
            price: '',
            discounts: '',
            discountCodes: '',
            discountPrices: ''
        };
    }
}
