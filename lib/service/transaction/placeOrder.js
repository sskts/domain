"use strict";
/**
 * placeOrder transaction service
 * 注文取引サービス
 * @namespace service.transaction.placeOrder
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const json2csv = require("json2csv");
const debug = createDebug('sskts-domain:service:transaction:placeOrder');
/**
 * ひとつの取引のタスクをエクスポートする
 */
function exportTasks(status) {
    return (taskRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const statusesTasksExportable = [factory.transactionStatusType.Expired, factory.transactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new factory.errors.Argument('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }
        const transaction = yield transactionRepository.transactionModel.findOneAndUpdate({
            status: status,
            tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
        }, { tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting }, { new: true }).exec()
            .then((doc) => (doc === null) ? null : doc.toObject());
        if (transaction === null) {
            return;
        }
        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = yield exportTasksById(transaction.id)(taskRepository, transactionRepository);
        yield transactionRepository.setTasksExportedById(transaction.id, tasks);
    });
}
exports.exportTasks = exportTasks;
/**
 * ID指定で取引のタスク出力
 */
function exportTasksById(transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (taskRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderById(transactionId);
        const taskAttributes = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                taskAttributes.push(factory.task.settleSeatReservation.createAttributes({
                    status: factory.taskStatus.Ready,
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
                    runsAt: new Date(),
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
        return yield Promise.all(taskAttributes.map((taskAttribute) => __awaiter(this, void 0, void 0, function* () {
            return yield taskRepository.save(taskAttribute);
        })));
    });
}
exports.exportTasksById = exportTasksById;
/**
 * 確定取引についてメールを送信する
 * @export
 * @function
 * @memberof service.transaction.placeOrder
 * @param transactionId 取引ID
 * @param emailMessageAttributes Eメールメッセージ属性
 */
function sendEmail(transactionId, emailMessageAttributes) {
    return (taskRepo, transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepo.findPlaceOrderById(transactionId);
        if (transaction.status !== factory.transactionStatusType.Confirmed) {
            throw new factory.errors.Forbidden('Transaction not confirmed.');
        }
        const emailMessage = factory.creativeWork.message.email.create({
            identifier: `placeOrderTransaction-${transactionId}`,
            sender: {
                typeOf: transaction.seller.typeOf,
                name: emailMessageAttributes.sender.name,
                email: emailMessageAttributes.sender.email
            },
            toRecipient: {
                typeOf: transaction.agent.typeOf,
                name: emailMessageAttributes.toRecipient.name,
                email: emailMessageAttributes.toRecipient.email
            },
            about: emailMessageAttributes.about,
            text: emailMessageAttributes.text
        });
        // その場で送信ではなく、DBにタスクを登録
        const taskAttributes = factory.task.sendEmailNotification.createAttributes({
            status: factory.taskStatus.Ready,
            runsAt: new Date(),
            remainingNumberOfTries: 10,
            lastTriedAt: null,
            numberOfTried: 0,
            executionResults: [],
            data: {
                transactionId: transactionId,
                emailMessage: emailMessage
            }
        });
        return yield taskRepo.save(taskAttributes);
    });
}
exports.sendEmail = sendEmail;
/**
 * フォーマット指定でダウンロード
 * @export
 * @function
 * @memberof service.transaction.placeOrder
 * @param conditions 検索条件
 * @param format フォーマット
 */
function download(conditions, format) {
    return (transactionRepo) => __awaiter(this, void 0, void 0, function* () {
        // 取引検索
        const transactions = yield transactionRepo.searchPlaceOrder(conditions);
        debug('transactions:', transactions);
        // 取引ごとに詳細を検索し、csvを作成する
        const data = yield Promise.all(transactions.map((transaction) => __awaiter(this, void 0, void 0, function* () { return transaction2report(transaction); })));
        debug('data:', data);
        if (format === 'csv') {
            return yield new Promise((resolve) => {
                const fields = Object.keys(data[0]);
                const fieldNames = Object.keys(data[0]);
                const output = json2csv({
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
        }
        else {
            throw new factory.errors.NotImplemented('specified format not implemented.');
        }
    });
}
exports.download = download;
function transaction2report(transaction) {
    if (transaction.result !== undefined) {
        const order = transaction.result.order;
        const orderItems = order.acceptedOffers;
        const screeningEvent = orderItems[0].itemOffered.reservationFor;
        const ticketsStr = orderItems.map(
        // tslint:disable-next-line:max-line-length
        (orderItem) => `${orderItem.itemOffered.reservedTicket.ticketedSeat.seatNumber} ${orderItem.itemOffered.reservedTicket.coaTicketInfo.ticketName} ￥${orderItem.itemOffered.reservedTicket.coaTicketInfo.salePrice}`).join('\n');
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
    }
    else {
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
exports.transaction2report = transaction2report;
