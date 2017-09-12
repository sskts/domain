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
const azureStorage = require("azure-storage");
const createDebug = require("debug");
const json2csv = require("json2csv");
const moment = require("moment");
// tslint:disable-next-line:no-require-imports no-var-requires
const jconv = require('jconv');
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
        const transactionDocs = yield transactionRepo.transactionModel.find({
            typeOf: factory.transactionType.PlaceOrder,
            startDate: {
                $gte: conditions.startFrom,
                $lte: conditions.startThrough
            }
        }).exec();
        debug('transactionDocs:', transactionDocs);
        // 取引ごとに詳細を検索し、csvを作成する
        // tslint:disable-next-line:max-func-body-length
        const data = yield Promise.all(transactionDocs.map((transactionDoc) => __awaiter(this, void 0, void 0, function* () {
            const transaction = transactionDoc.toObject();
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
            }
            else {
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
        })));
        debug('data:', data);
        if (format === 'csv') {
            return yield new Promise((resolve, reject) => {
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
                // save to blob
                const blobService = azureStorage.createBlobService();
                const CONTAINER = 'transactions-csvs';
                blobService.createContainerIfNotExists(CONTAINER, {}, (createContainerError) => {
                    if (createContainerError instanceof Error) {
                        reject(createContainerError);
                        return;
                    }
                    const blob = `sskts-line-assistant-transactions-${moment().format('YYYYMMDDHHmmss')}.csv`;
                    blobService.createBlockBlobFromText(CONTAINER, blob, jconv.convert(output, 'UTF8', 'SJIS'), (createBlockBlobError, result, response) => {
                        debug(createBlockBlobError, result, response);
                        if (createBlockBlobError instanceof Error) {
                            reject(createBlockBlobError);
                            return;
                        }
                        // 期限つきのURLを発行する
                        const startDate = new Date();
                        const expiryDate = new Date(startDate);
                        // tslint:disable-next-line:no-magic-numbers
                        expiryDate.setMinutes(startDate.getMinutes() + 10);
                        // tslint:disable-next-line:no-magic-numbers
                        startDate.setMinutes(startDate.getMinutes() - 10);
                        const sharedAccessPolicy = {
                            AccessPolicy: {
                                Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
                                Start: startDate,
                                Expiry: expiryDate
                            }
                        };
                        const token = blobService.generateSharedAccessSignature(result.container, result.name, sharedAccessPolicy);
                        resolve(blobService.getUrl(result.container, result.name, token));
                    });
                });
            });
        }
        else {
            throw new factory.errors.NotImplemented('specified format not implemented.');
        }
    });
}
exports.download = download;
