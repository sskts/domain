"use strict";
/**
 * 取引サービス
 *
 * @namespace service/transaction/placeOrder
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
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const argument_1 = require("../../error/argument");
const debug = createDebug('sskts-domain:service:transaction:placeOrder');
/**
 * 取引開始
 */
function start(args) {
    return (
        // personAdapter: PersonAdapter,
        organizationAdapter, transactionAdapter, transactionCountAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }
        const agent = {
            typeOf: 'Person',
            id: args.agentId,
            url: ''
        };
        if (args.clientUser.username !== undefined) {
            agent.memberOf = {
                membershipNumber: args.agentId,
                programName: 'Amazon Cognito'
            };
        }
        // 売り手を取得
        const sellerDoc = yield organizationAdapter.organizationModel.findById(args.sellerId).exec();
        if (sellerDoc === null) {
            throw new Error('seller not found');
        }
        const seller = sellerDoc.toObject();
        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = factory.transaction.placeOrder.create({
            status: factory.transactionStatusType.InProgress,
            agent: agent,
            seller: {
                typeOf: 'MovieTheater',
                id: seller.id,
                name: seller.name.ja,
                url: seller.url
            },
            object: {
                clientUser: args.clientUser,
                paymentInfos: [],
                discountInfos: []
            },
            expires: args.expires,
            startDate: moment().toDate()
        });
        debug('creating transaction...', transaction);
        // mongoDBに追加するために_id属性を拡張
        yield transactionAdapter.transactionModel.create(Object.assign({}, transaction, { _id: transaction.id }));
        return monapt.Option(transaction);
    });
}
exports.start = start;
/**
 * 取引を期限切れにする
 */
function makeExpired() {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const endDate = moment().toDate();
        // ステータスと期限を見て更新
        yield transactionAdapter.transactionModel.update({
            status: factory.transactionStatusType.InProgress,
            expires: { $lt: endDate }
        }, {
            status: factory.transactionStatusType.Expired,
            endDate: endDate
        }, { multi: true }).exec();
    });
}
exports.makeExpired = makeExpired;
/**
 * ひとつの取引のタスクをエクスポートする
 */
function exportTasks(status) {
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const statusesTasksExportable = [factory.transactionStatusType.Expired, factory.transactionStatusType.Confirmed];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new argument_1.default('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }
        const transaction = yield transactionAdapter.transactionModel.findOneAndUpdate({
            status: status,
            tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
        }, { tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting }, { new: true }).exec()
            .then((doc) => (doc === null) ? null : doc.toObject());
        if (transaction === null) {
            return;
        }
        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = yield exportTasksById(transaction.id)(taskAdapter, transactionAdapter);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            tasksExportationStatus: factory.transactionTasksExportationStatus.Exported,
            tasksExportedAt: moment().toDate(),
            tasks: tasks
        }).exec();
    });
}
exports.exportTasks = exportTasks;
/**
 * ID指定で取引のタスク出力
 */
function exportTasksById(transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (taskAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionAdapter.transactionModel.findById(transactionId).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error(`trade[${transactionId}] not found.`);
            }
            return doc.toObject();
        });
        const tasks = [];
        switch (transaction.status) {
            case factory.transactionStatusType.Confirmed:
                tasks.push(factory.task.settleSeatReservation.create({
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
                tasks.push(factory.task.settleGMO.create({
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
                tasks.push(factory.task.settleMvtk.create({
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
                tasks.push(factory.task.createOrder.create({
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
                //         tasks.push(SendEmailNotificationTaskFactory.create({
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
                tasks.push(factory.task.cancelSeatReservation.create({
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
                tasks.push(factory.task.cancelGMO.create({
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
                tasks.push(factory.task.cancelMvtk.create({
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
                throw new argument_1.default('id', 'transaction group not implemented.');
        }
        debug('tasks prepared', tasks);
        yield Promise.all(tasks.map((task) => __awaiter(this, void 0, void 0, function* () {
            debug('storing task...', task);
            yield taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        })));
        return tasks;
    });
}
exports.exportTasksById = exportTasksById;
/**
 * タスクエクスポートリトライ
 * todo updatedAtを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
function reexportTasks(intervalInMinutes) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting,
            updatedAt: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
        }, {
            tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
        }).exec();
    });
}
exports.reexportTasks = reexportTasks;
/**
 * 進行中の取引を取得する
 */
function findInProgressById(transactionId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        return yield transactionAdapter.transactionModel.findOne({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder,
            status: factory.transactionStatusType.InProgress
        }).exec()
            .then((doc) => {
            return (doc === null) ? monapt.None : monapt.Option(doc.toObject());
        });
    });
}
exports.findInProgressById = findInProgressById;
/**
 * クレジットカードオーソリ取得
 */
function createCreditCardAuthorization(transactionId, orderId, amount, method, creditCard) {
    return (organizationAdapter, transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // GMOショップ情報取得
        const movieTheater = yield organizationAdapter.organizationModel.findById(transaction.seller.id).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('movieTheater not found');
            }
            return doc.toObject();
        });
        // GMOオーソリ取得
        const entryTranResult = yield GMO.services.credit.entryTran({
            shopId: movieTheater.gmoInfo.shopId,
            shopPass: movieTheater.gmoInfo.shopPass,
            orderId: orderId,
            jobCd: GMO.utils.util.JobCd.Auth,
            amount: amount
        });
        const execTranArgs = Object.assign({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: method,
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS
        }, creditCard, {
            seqMode: GMO.utils.util.SeqMode.Physics
        });
        const execTranResult = yield GMO.services.credit.execTran(execTranArgs);
        debug(execTranResult);
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = factory.authorization.gmo.create({
            price: amount,
            object: {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                amount: amount,
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                jobCd: GMO.utils.util.JobCd.Auth,
                payType: GMO.utils.util.PayType.Credit
            },
            result: execTranResult
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionId, { $push: { 'object.paymentInfos': gmoAuthorization } }).exec();
        debug('GMOAuthorization added.');
        return gmoAuthorization;
    });
}
exports.createCreditCardAuthorization = createCreditCardAuthorization;
function cancelGMOAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const authorization = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.group === factory.authorizationGroup.GMO);
        if (authorization === undefined) {
            throw new argument_1.default('authorizationId', '指定されたオーソリは見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new argument_1.default('authorizationId', '指定されたオーソリは見つかりません');
        }
        // 決済取消
        yield GMO.services.credit.alterTran({
            shopId: authorization.object.shopId,
            shopPass: authorization.object.shopPass,
            accessId: authorization.object.accessId,
            accessPass: authorization.object.accessPass,
            jobCd: GMO.utils.util.JobCd.Void
        });
        debug('alterTran processed', GMO.utils.util.JobCd.Void);
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            $pull: { 'object.paymentInfos': { id: authorizationId } }
        }).exec();
    });
}
exports.cancelGMOAuthorization = cancelGMOAuthorization;
function createSeatReservationAuthorization(transactionId, individualScreeningEvent, offers) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // todo 座席コードがすでにキープ済みのものかどうかチェックできる？
        // COA仮予約
        const updTmpReserveSeatArgs = {
            theaterCode: individualScreeningEvent.coaInfo.theaterCode,
            dateJouei: individualScreeningEvent.coaInfo.dateJouei,
            titleCode: individualScreeningEvent.coaInfo.titleCode,
            titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum,
            timeBegin: individualScreeningEvent.coaInfo.timeBegin,
            screenCode: individualScreeningEvent.coaInfo.screenCode,
            listSeat: offers.map((offer) => {
                return {
                    seatSection: offer.seatSection,
                    seatNum: offer.seatNumber
                };
            })
        };
        debug('updTmpReserveSeat processing...', updTmpReserveSeatArgs);
        const reserveSeatsTemporarilyResult = yield COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
        debug('updTmpReserveSeat processed', reserveSeatsTemporarilyResult);
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const authorization = factory.authorization.seatReservation.createFromCOATmpReserve({
            updTmpReserveSeatArgs: updTmpReserveSeatArgs,
            reserveSeatsTemporarilyResult: reserveSeatsTemporarilyResult,
            offers: offers,
            individualScreeningEvent: individualScreeningEvent
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, { 'object.seatReservation': authorization }).exec();
        debug('coaAuthorization added.');
        return authorization;
    });
}
exports.createSeatReservationAuthorization = createSeatReservationAuthorization;
function cancelSeatReservationAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const authorization = transaction.object.seatReservation;
        if (authorization === undefined) {
            throw new argument_1.default('authorizationId', '指定された座席予約は見つかりません');
        }
        if (authorization.id !== authorizationId) {
            throw new argument_1.default('authorizationId', '指定された座席予約は見つかりません');
        }
        // 座席仮予約削除
        debug('delTmpReserve processing...', authorization);
        yield COA.services.reserve.delTmpReserve({
            theaterCode: authorization.object.updTmpReserveSeatArgs.theaterCode,
            dateJouei: authorization.object.updTmpReserveSeatArgs.dateJouei,
            titleCode: authorization.object.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: authorization.object.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: authorization.object.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: authorization.result.tmpReserveNum
        });
        debug('delTmpReserve processed');
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            $unset: { 'object.seatReservation': 1 }
        }).exec();
    });
}
exports.cancelSeatReservationAuthorization = cancelSeatReservationAuthorization;
/**
 * create a mvtk authorization
 * add the result of using a mvtk card
 * @export
 * @function
 * @param {string} transactionId
 * @param {factory.authorization.mvtk.IResult} authorizationResult
 * @return {ITransactionOperation<factory.authorization.mvtk.IAuthorization>}
 * @memberof service/transaction/placeOrder
 */
function createMvtkAuthorization(transactionId, authorizationResult) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const seatReservationAuthorization = transaction.object.seatReservation;
        // seatReservationAuthorization already exists?
        if (seatReservationAuthorization === undefined) {
            throw new Error('seat reservation authorization not created yet');
        }
        const knyknrNoNumsByNoShouldBe = seatReservationAuthorization.object.acceptedOffers.reduce((a, b) => {
            const knyknrNo = b.itemOffered.reservedTicket.coaTicketInfo.mvtkNum;
            if (a[knyknrNo] === undefined) {
                a[knyknrNo] = 0;
            }
            a[knyknrNo] += 1;
            return a;
        }, {});
        const knyknrNoNumsByNo = authorizationResult.knyknrNoInfo.reduce((a, b) => {
            if (a[b.knyknrNo] === undefined) {
                a[b.knyknrNo] = 0;
            }
            const knyknrNoNum = b.knshInfo.reduce((a2, b2) => a2 + b2.miNum, 0);
            a[b.knyknrNo] += knyknrNoNum;
            return a;
        }, {});
        debug('knyknrNoNumsByNo:', knyknrNoNumsByNo);
        debug('knyyknrNoNumsByNoShouldBe:', knyknrNoNumsByNoShouldBe);
        const knyknrNoExistsInSeatReservation = Object.keys(knyknrNoNumsByNo).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        const knyknrNoExistsMvtkResult = Object.keys(knyknrNoNumsByNoShouldBe).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        if (!knyknrNoExistsInSeatReservation || !knyknrNoExistsMvtkResult) {
            throw new argument_1.default('authorizationResult', 'knyknrNoInfo not matched with seat reservation authorization');
        }
        // stCd matched? (last two figures of theater code)
        // tslint:disable-next-line:no-magic-numbers
        const stCdShouldBe = seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode.slice(-2);
        if (authorizationResult.stCd !== stCdShouldBe) {
            throw new argument_1.default('authorizationResult', 'stCd not matched with seat reservation authorization');
        }
        // skhnCd matched?
        // tslint:disable-next-line:max-line-length
        const skhnCdShouldBe = `${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleCode}${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleBranchNum}`;
        if (authorizationResult.skhnCd !== skhnCdShouldBe) {
            throw new argument_1.default('authorizationResult', 'skhnCd not matched with seat reservation authorization');
        }
        // screen code matched?
        if (authorizationResult.screnCd !== seatReservationAuthorization.object.updTmpReserveSeatArgs.screenCode) {
            throw new argument_1.default('authorizationResult', 'screnCd not matched with seat reservation authorization');
        }
        // seat num matched?
        const seatNumsInSeatReservationAuthorization = seatReservationAuthorization.result.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizationResult.zskInfo.every((zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0)) {
            throw new argument_1.default('authorizationResult', 'zskInfo not matched with seat reservation authorization');
        }
        const authorization = factory.authorization.mvtk.create({
            price: authorizationResult.price,
            result: authorizationResult,
            object: {}
        });
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transactionId, { $push: { 'object.discountInfos': authorization } }).exec();
        return authorization;
    });
}
exports.createMvtkAuthorization = createMvtkAuthorization;
function cancelMvtkAuthorization(transactionId, authorizationId) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        const authorization = transaction.object.discountInfos.find((discountInfo) => discountInfo.group === factory.authorizationGroup.MVTK);
        if (authorization === undefined) {
            throw new argument_1.default('authorizationId', 'mvtk authorization not found');
        }
        if (authorization.id !== authorizationId) {
            throw new argument_1.default('authorizationId', 'mvtk authorization not found');
        }
        yield transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
            $pull: { 'object.discountInfos': { id: authorizationId } }
        }).exec();
    });
}
exports.cancelMvtkAuthorization = cancelMvtkAuthorization;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
// export function addEmail(transactionId: string, notification: EmailNotificationFactory.INotification) {
//     return async (transactionAdapter: TransactionAdapter) => {
//         // イベント作成
//         const event = AddNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: notification
//         });
//         // 永続化
//         debug('adding an event...', event);
//         await pushEvent(transactionId, event)(transactionAdapter);
//     };
// }
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
// export function removeEmail(transactionId: string, notificationId: string) {
//     return async (transactionAdapter: TransactionAdapter) => {
//         const transaction = await findInProgressById(transactionId)(transactionAdapter)
//             .then((option) => {
//                 if (option.isEmpty) {
//                     throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
//                 }
//                 return option.get();
//             });
//         type ITransactionEvent = AddNotificationTransactionEventFactory.ITransactionEvent<EmailNotificationFactory.INotification>;
//         const addNotificationTransactionEvent = <ITransactionEvent>transaction.object.actionEvents.find(
//             (actionEvent) =>
//                 actionEvent.actionEventType === TransactionEventGroup.AddNotification &&
//                 (<ITransactionEvent>actionEvent).notification.id === notificationId
//         );
//         if (addNotificationTransactionEvent === undefined) {
//             throw new ArgumentError('notificationId', `notification [${notificationId}] not found in the transaction.`);
//         }
//         // イベント作成
//         const event = RemoveNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: addNotificationTransactionEvent.notification
//         });
//         // 永続化
//         await pushEvent(transactionId, event)(transactionAdapter);
//     };
// }
/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 */
function setAgentProfile(transactionId, profile) {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // 永続化
        debug('setting person profile...');
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: transactionId,
            status: factory.transactionStatusType.InProgress
        }, {
            'object.customerContact': profile
        }).exec();
    });
}
exports.setAgentProfile = setAgentProfile;
/**
 * 取引確定
 */
function confirm(transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield findInProgressById(transactionId)(transactionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('transactionId', `transaction[${transactionId}] not found.`);
            }
            return option.get();
        });
        // 照会可能になっているかどうか
        if (!canBeClosed(transaction)) {
            throw new Error('transaction cannot be closed');
        }
        // 結果作成
        const order = factory.order.createFromPlaceOrderTransaction({
            transaction: transaction
        });
        const ownershipInfos = order.acceptedOffers.map((acceptedOffer) => {
            return factory.ownershipInfo.create({
                ownedBy: {
                    id: transaction.agent.id,
                    typeOf: transaction.agent.typeOf,
                    name: order.customer.name
                },
                acquiredFrom: transaction.seller,
                ownedFrom: new Date(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: acceptedOffer.itemOffered
            });
        });
        const result = {
            order: order,
            ownershipInfos: ownershipInfos
        };
        // ステータス変更
        debug('updating transaction...');
        yield transactionAdapter.transactionModel.findOneAndUpdate({
            _id: transactionId,
            status: factory.transactionStatusType.InProgress
        }, {
            status: factory.transactionStatusType.Confirmed,
            endDate: moment().toDate(),
            result: result
        }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('進行中の購入アクションはありません');
            }
        });
        return order;
    });
}
exports.confirm = confirm;
/**
 * whether a transaction can be closed
 * @function
 * @returns {boolean}
 */
function canBeClosed(transaction) {
    // seatReservation exists?
    const seatReservationAuthorization = transaction.object.seatReservation;
    if (seatReservationAuthorization === undefined) {
        return false;
    }
    const paymentInfos = transaction.object.paymentInfos;
    const discountInfos = transaction.object.discountInfos;
    const priceBySeller = seatReservationAuthorization.price;
    const priceByAgent = paymentInfos.reduce((a, b) => a + b.price, 0) + discountInfos.reduce((a, b) => a + b.price, 0);
    // price matched between an agent and a seller?
    return priceByAgent === priceBySeller;
}
