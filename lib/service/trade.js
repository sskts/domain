"use strict";
/**
 * 取引サービス
 *
 * @namespace service/trade
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
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const argument_1 = require("../error/argument");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const notificationGroup_1 = require("../factory/notificationGroup");
const PersonFactory = require("../factory/person");
const actionStatusType_1 = require("../factory/actionStatusType");
const CancelGMOAuthorizationTaskFactory = require("../factory/task/cancelGMOAuthorization");
const CancelMvtkAuthorizationTaskFactory = require("../factory/task/cancelMvtkAuthorization");
const CancelSeatReservationAuthorizationTaskFactory = require("../factory/task/cancelSeatReservationAuthorization");
const SendEmailNotificationTaskFactory = require("../factory/task/sendEmailNotification");
const SettleGMOAuthorizationTaskFactoryTaskFactory = require("../factory/task/settleGMOAuthorization");
const SettleMvtkAuthorizationTaskFactory = require("../factory/task/settleMvtkAuthorization");
const SettleSeatReservationAuthorizationTaskFactory = require("../factory/task/settleSeatReservationAuthorization");
const taskStatus_1 = require("../factory/taskStatus");
const BuyActionFactory = require("../factory/action/buyAction");
const actionEventType_1 = require("../factory/actionEventType");
const actionStatusType_2 = require("../factory/actionStatusType");
const actionTasksExportationStatus_1 = require("../factory/actionTasksExportationStatus");
const debug = createDebug('sskts-domain:service:transaction');
/**
 * 注文開始
 */
function start(args) {
    return (personAdapter, organizationAdapter, actionAdapter, transactionCountAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }
        // 利用可能であれば、取引作成&匿名所有者作成
        let person;
        if (args.agentId === undefined) {
            // 一般所有者作成
            person = yield PersonFactory.create({
                owns: []
            });
        }
        else {
            // 所有者指定であれば存在確認
            const personDoc = yield personAdapter.personModel.findById(args.agentId).exec();
            if (personDoc === null) {
                throw new argument_1.default('agentId', `person[id:${args.agentId}] not found`);
            }
            person = personDoc.toObject();
        }
        // 売り手を取得
        const sellerDoc = yield organizationAdapter.organizationModel.findById(args.sellerId).exec();
        if (sellerDoc === null) {
            throw new Error('seller not found');
        }
        const seller = sellerDoc.toObject();
        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const buyAction = BuyActionFactory.create({
            actionStatus: actionStatusType_2.default.ActiveActionStatus,
            agent: {
                typeOf: 'Person',
                id: person.id,
                name: `${person.familyName} ${person.givenName}`
            },
            seller: {
                typeOf: 'MovieTheater',
                id: seller.id,
                name: seller.name.ja
            },
            object: {
                clientUser: args.clientUser,
                actionEvents: []
            },
            expires: args.expires,
            startDate: moment().toDate()
        });
        // 所有者永続化
        // createコマンドで作成すること(ありえないはずだが、万が一所有者IDが重複するようなバグがあっても、ユニークインデックスではじかれる)
        if (args.agentId === undefined) {
            debug('creating person...', person);
            yield personAdapter.personModel.create(Object.assign({}, person, { _id: person.id }));
        }
        debug('creating transaction...');
        // mongoDBに追加するために_id属性を拡張
        yield actionAdapter.actionModel.create(Object.assign({}, buyAction, { _id: buyAction.id }));
        return monapt.Option(buyAction);
    });
}
exports.start = start;
/**
 * 注文内容を照会する
 */
function makeInquiryAboutOrder(orderInquiryKey) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        return yield actionAdapter.actionModel.findOne({
            'object.orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
            'object.orderInquiryKey.orderNumber': orderInquiryKey.orderNumber,
            'object.orderInquiryKey.telephone': orderInquiryKey.telephone,
            actionStatus: actionStatusType_1.default.CompletedActionStatus
        }, 'result').exec()
            .then((doc) => {
            if (doc === null) {
                return monapt.None;
            }
            const buyActionResult = doc.toObject().result;
            return monapt.Option(buyActionResult.order);
        });
    });
}
exports.makeInquiryAboutOrder = makeInquiryAboutOrder;
/**
 * 取引を期限切れにする
 */
function makeExpired() {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const endDate = moment().toDate();
        // ステータスと期限を見て更新
        yield actionAdapter.actionModel.update({
            actionStatus: actionStatusType_1.default.ActiveActionStatus,
            expires: { $lt: endDate }
        }, {
            actionStatus: actionStatusType_1.default.ExpiredActionStatus,
            endDate: endDate
        }, { multi: true }).exec();
    });
}
exports.makeExpired = makeExpired;
/**
 * ひとつの取引のタスクをエクスポートする
 *
 * @param {ActionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
function exportTasks(status) {
    return (taskAdapter, actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const statusesTasksExportable = [actionStatusType_1.default.ExpiredActionStatus, actionStatusType_1.default.CompletedActionStatus];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new argument_1.default('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }
        const buyAction = yield actionAdapter.actionModel.findOneAndUpdate({
            actionStatus: status,
            tasksExportationStatus: actionTasksExportationStatus_1.default.Unexported
        }, { tasksExportationStatus: actionTasksExportationStatus_1.default.Exporting }, { new: true }).exec()
            .then((doc) => (doc === null) ? null : doc.toObject());
        if (buyAction === null) {
            return;
        }
        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = yield exportTasksById(buyAction.id)(taskAdapter, actionAdapter);
        yield actionAdapter.actionModel.findByIdAndUpdate(buyAction.id, {
            tasksExportationStatus: actionTasksExportationStatus_1.default.Exported,
            tasks_exported_at: moment().toDate(),
            tasks: tasks
        }).exec();
    });
}
exports.exportTasks = exportTasks;
/**
 * ID指定で取引のタスク出力
 */
function exportTasksById(actionId) {
    // tslint:disable-next-line:max-func-body-length
    return (taskAdapter, actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield actionAdapter.actionModel.findById(actionId).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error(`trade[${actionId}] not found.`);
            }
            return doc.toObject();
        });
        // 承認リストを取り出す
        const removedAuthorizationIds = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.Unauthorize)
            .map((actionEvent) => actionEvent.authorization.id);
        const authorizations = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.Authorize)
            .map((actionEvent) => actionEvent.authorization)
            .filter((authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0);
        const removedNotificationIds = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.RemoveNotification)
            .map((actionEvent) => actionEvent.notification.id);
        const notifications = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.AddNotification)
            .map((actionEvent) => actionEvent.notification)
            .filter((notification) => removedNotificationIds.indexOf(notification.id) < 0);
        const tasks = [];
        switch (buyAction.actionStatus) {
            case actionStatusType_1.default.CompletedActionStatus:
                // 取引イベントからタスクリストを作成
                authorizations.forEach((authorization) => {
                    if (authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION) {
                        tasks.push(SettleSeatReservationAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.GMO) {
                        tasks.push(SettleGMOAuthorizationTaskFactoryTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.MVTK) {
                        tasks.push(SettleMvtkAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                });
                notifications.forEach((notification) => {
                    if (notification.group === notificationGroup_1.default.EMAIL) {
                        tasks.push(SendEmailNotificationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                notification: notification
                            }
                        }));
                    }
                });
                break;
            // 期限切れの場合は、タスクリストを作成する
            case actionStatusType_1.default.ExpiredActionStatus:
                authorizations.forEach((authorization) => {
                    if (authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION) {
                        tasks.push(CancelSeatReservationAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.GMO) {
                        tasks.push(CancelGMOAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                    else if (authorization.group === authorizationGroup_1.default.MVTK) {
                        tasks.push(CancelMvtkAuthorizationTaskFactory.create({
                            status: taskStatus_1.default.Ready,
                            runsAt: new Date(),
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: authorization
                            }
                        }));
                    }
                });
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
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
function reexportTasks(intervalInMinutes) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield actionAdapter.actionModel.findOneAndUpdate({
            tasksExportationStatus: actionTasksExportationStatus_1.default.Exporting,
            updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
        }, {
            tasksExportationStatus: actionTasksExportationStatus_1.default.Unexported
        }).exec();
    });
}
exports.reexportTasks = reexportTasks;
