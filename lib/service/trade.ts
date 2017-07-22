/**
 * 取引サービス
 *
 * @namespace service/trade
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
import AuthorizationGroup from '../factory/authorizationGroup';
import * as clientUserFactory from '../factory/clientUser';
import * as NotificationFactory from '../factory/notification';
import * as EmailNotificationFactory from '../factory/notification/email';
import NotificationGroup from '../factory/notificationGroup';
import * as OrganizationFactory from '../factory/organization';
import * as PersonFactory from '../factory/person';

import ActionStatusType from '../factory/actionStatusType';
import * as OrderFactory from '../factory/order';
import * as TaskFactory from '../factory/task';
import * as CancelGMOAuthorizationTaskFactory from '../factory/task/cancelGMOAuthorization';
import * as CancelMvtkAuthorizationTaskFactory from '../factory/task/cancelMvtkAuthorization';
import * as CancelSeatReservationAuthorizationTaskFactory from '../factory/task/cancelSeatReservationAuthorization';
import * as SendEmailNotificationTaskFactory from '../factory/task/sendEmailNotification';
import * as SettleGMOAuthorizationTaskFactoryTaskFactory from '../factory/task/settleGMOAuthorization';
import * as SettleMvtkAuthorizationTaskFactory from '../factory/task/settleMvtkAuthorization';
import * as SettleSeatReservationAuthorizationTaskFactory from '../factory/task/settleSeatReservationAuthorization';
import TaskStatus from '../factory/taskStatus';

import * as BuyActionFactory from '../factory/action/buyAction';
import * as AddNotificationActionEventFactory from '../factory/actionEvent/addNotification';
import * as AuthorizeActionEventFactory from '../factory/actionEvent/authorize';
import * as RemoveNotificationActionEventFactory from '../factory/actionEvent/removeNotification';
import * as UnauthorizeActionEventFactory from '../factory/actionEvent/unauthorize';
import ActionEventType from '../factory/actionEventType';
import * as ActionScopeFactory from '../factory/actionScope';
import ActionStatus from '../factory/actionStatusType';
import ActionTasksExportationStatus from '../factory/actionTasksExportationStatus';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';

import ActionAdapter from '../adapter/action';
import OrganizationAdapter from '../adapter/organization';
import PersonAdapter from '../adapter/person';
import TaskAdapter from '../adapter/task';
import TransactionCountAdapter from '../adapter/transactionCount';

export type TaskAndActionOperation<T> =
    (taskAdapter: TaskAdapter, actionAdapter: ActionAdapter) => Promise<T>;
export type ActionOperation<T> = (actionAdapter: ActionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:transaction');

/**
 * 注文開始
 */
export function start(args: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: clientUserFactory.IClientUser;
    scope: ActionScopeFactory.IActionScope;
    agentId?: string;
    sellerId: string;
}) {
    return async (
        personAdapter: PersonAdapter,
        organizationAdapter: OrganizationAdapter,
        actionAdapter: ActionAdapter,
        transactionCountAdapter: TransactionCountAdapter
    ) => {
        // 利用可能かどうか
        const nextCount = await transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }

        // 利用可能であれば、取引作成&匿名所有者作成
        let person: PersonFactory.IPerson;
        if (args.agentId === undefined) {
            // 一般所有者作成
            person = await PersonFactory.create({
                owns: []
            });
        } else {
            // 所有者指定であれば存在確認
            const personDoc = await personAdapter.personModel.findById(args.agentId).exec();
            if (personDoc === null) {
                throw new ArgumentError('agentId', `person[id:${args.agentId}] not found`);
            }
            person = <PersonFactory.IPerson>personDoc.toObject();
        }

        // 売り手を取得
        const sellerDoc = await organizationAdapter.organizationModel.findById(args.sellerId).exec();
        if (sellerDoc === null) {
            throw new Error('seller not found');
        }
        const seller = <OrganizationFactory.IOrganization>sellerDoc.toObject();

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const buyAction = BuyActionFactory.create({
            actionStatus: ActionStatus.ActiveActionStatus,
            agent: {
                typeOf: 'Person', // todo enum管理
                id: person.id,
                name: `${person.familyName} ${person.givenName}`
            },
            seller: {
                typeOf: 'MovieTheater', // todo enum管理
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
            await personAdapter.personModel.create({ ...person, ...{ _id: person.id } });
        }

        debug('creating transaction...');
        // mongoDBに追加するために_id属性を拡張
        await actionAdapter.actionModel.create({ ...buyAction, ...{ _id: buyAction.id } });

        return monapt.Option(buyAction);
    };
}

/**
 * 注文内容を照会する
 */
export function makeInquiryAboutOrder(
    orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey
): ActionOperation<monapt.Option<OrderFactory.IOrder>> {
    return async (actionAdapter: ActionAdapter) => {
        return await actionAdapter.actionModel.findOne(
            {
                'object.orderInquiryKey.theaterCode': orderInquiryKey.theaterCode,
                'object.orderInquiryKey.orderNumber': orderInquiryKey.orderNumber,
                'object.orderInquiryKey.telephone': orderInquiryKey.telephone,
                actionStatus: ActionStatusType.CompletedActionStatus
            },
            'result'
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    return monapt.None;
                }

                const buyActionResult = <BuyActionFactory.IResult>(<BuyActionFactory.IAction>doc.toObject()).result;

                return monapt.Option(buyActionResult.order);
            });
    };
}

/**
 * 取引を期限切れにする
 */
export function makeExpired() {
    return async (actionAdapter: ActionAdapter) => {
        const endDate = moment().toDate();

        // ステータスと期限を見て更新
        await actionAdapter.actionModel.update(
            {
                actionStatus: ActionStatusType.ActiveActionStatus,
                expires: { $lt: endDate }
            },
            {
                actionStatus: ActionStatusType.ExpiredActionStatus,
                endDate: endDate
            },
            { multi: true }
        ).exec();
    };
}

/**
 * ひとつの取引のタスクをエクスポートする
 *
 * @param {ActionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
export function exportTasks(status: ActionStatus): TaskAndActionOperation<void> {
    return async (taskAdapter: TaskAdapter, actionAdapter: ActionAdapter) => {
        const statusesTasksExportable = [ActionStatusType.ExpiredActionStatus, ActionStatusType.CompletedActionStatus];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new ArgumentError('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const buyAction = await actionAdapter.actionModel.findOneAndUpdate(
            {
                actionStatus: status,
                tasksExportationStatus: ActionTasksExportationStatus.Unexported
            },
            { tasksExportationStatus: ActionTasksExportationStatus.Exporting },
            { new: true }
        ).exec()
            .then((doc) => (doc === null) ? null : <BuyActionFactory.IAction>doc.toObject());

        if (buyAction === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = await exportTasksById(buyAction.id)(
            taskAdapter,
            actionAdapter
        );

        await actionAdapter.actionModel.findByIdAndUpdate(
            buyAction.id,
            {
                tasksExportationStatus: ActionTasksExportationStatus.Exported,
                tasks_exported_at: moment().toDate(),
                tasks: tasks
            }
        ).exec();
    };
}

/**
 * ID指定で取引のタスク出力
 */
export function exportTasksById(actionId: string): TaskAndActionOperation<TaskFactory.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (taskAdapter: TaskAdapter, actionAdapter: ActionAdapter) => {
        const buyAction = await actionAdapter.actionModel.findById(actionId).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error(`trade[${actionId}] not found.`);
                }

                return <BuyActionFactory.IAction>doc.toObject();
            });

        // 承認リストを取り出す
        const removedAuthorizationIds = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === ActionEventType.Unauthorize)
            .map((actionEvent: UnauthorizeActionEventFactory.IActionEvent) => actionEvent.authorization.id);
        const authorizations = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === ActionEventType.Authorize)
            .map((actionEvent: AuthorizeActionEventFactory.IActionEvent) => actionEvent.authorization)
            .filter((authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0);

        // 通知リストを取り出す
        type IAddNotificationActionEvent = AddNotificationActionEventFactory.IActionEvent<NotificationFactory.INotification>;
        type IRemoveotificationActionEvent =
            RemoveNotificationActionEventFactory.IActionEvent<NotificationFactory.INotification>;
        const removedNotificationIds = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === ActionEventType.RemoveNotification)
            .map((actionEvent: IRemoveotificationActionEvent) => actionEvent.notification.id);
        const notifications = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === ActionEventType.AddNotification)
            .map((actionEvent: IAddNotificationActionEvent) => actionEvent.notification)
            .filter((notification) => removedNotificationIds.indexOf(notification.id) < 0);

        const tasks: TaskFactory.ITask[] = [];
        switch (buyAction.actionStatus) {
            case ActionStatusType.CompletedActionStatus:
                // 取引イベントからタスクリストを作成
                authorizations.forEach((authorization) => {
                    if (authorization.group === AuthorizationGroup.COA_SEAT_RESERVATION) {
                        tasks.push(SettleSeatReservationAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: <COASeatReservationAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.GMO) {
                        tasks.push(SettleGMOAuthorizationTaskFactoryTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: <GMOAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.MVTK) {
                        tasks.push(SettleMvtkAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: <MvtkAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    }
                });

                notifications.forEach((notification) => {
                    if (notification.group === NotificationGroup.EMAIL) {
                        tasks.push(SendEmailNotificationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // todo emailのsent_atを指定
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                notification: <EmailNotificationFactory.INotification>notification
                            }
                        }));
                    }
                });

                break;

            // 期限切れの場合は、タスクリストを作成する
            case ActionStatusType.ExpiredActionStatus:
                authorizations.forEach((authorization) => {
                    if (authorization.group === AuthorizationGroup.COA_SEAT_RESERVATION) {
                        tasks.push(CancelSeatReservationAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: <COASeatReservationAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.GMO) {
                        tasks.push(CancelGMOAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: <GMOAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.MVTK) {
                        tasks.push(CancelMvtkAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runsAt: new Date(), // なるはやで実行
                            remainingNumberOfTries: 10,
                            lastTriedAt: null,
                            numberOfTried: 0,
                            executionResults: [],
                            data: {
                                authorization: <MvtkAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    }
                });

                break;

            default:
                throw new ArgumentError('id', 'transaction group not implemented.');
        }
        debug('tasks prepared', tasks);

        await Promise.all(tasks.map(async (task) => {
            debug('storing task...', task);
            await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        }));

        return tasks;
    };
}

/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export function reexportTasks(intervalInMinutes: number) {
    return async (actionAdapter: ActionAdapter) => {
        await actionAdapter.actionModel.findOneAndUpdate(
            {
                tasksExportationStatus: ActionTasksExportationStatus.Exporting,
                updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
            },
            {
                tasksExportationStatus: ActionTasksExportationStatus.Unexported
            }
        ).exec();
    };
}
