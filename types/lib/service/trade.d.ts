import * as monapt from 'monapt';
import * as clientUserFactory from '../factory/clientUser';
import * as OrderFactory from '../factory/order';
import * as TaskFactory from '../factory/task';
import * as BuyActionFactory from '../factory/action/buyAction';
import * as ActionScopeFactory from '../factory/actionScope';
import ActionStatus from '../factory/actionStatusType';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';
import ActionAdapter from '../adapter/action';
import OrganizationAdapter from '../adapter/organization';
import PersonAdapter from '../adapter/person';
import TaskAdapter from '../adapter/task';
import TransactionCountAdapter from '../adapter/transactionCount';
export declare type TaskAndActionOperation<T> = (taskAdapter: TaskAdapter, actionAdapter: ActionAdapter) => Promise<T>;
export declare type ActionOperation<T> = (actionAdapter: ActionAdapter) => Promise<T>;
/**
 * 注文開始
 */
export declare function start(args: {
    expires: Date;
    maxCountPerUnit: number;
    clientUser: clientUserFactory.IClientUser;
    scope: ActionScopeFactory.IActionScope;
    agentId?: string;
    sellerId: string;
}): (personAdapter: PersonAdapter, organizationAdapter: OrganizationAdapter, actionAdapter: ActionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<monapt.Option<BuyActionFactory.IAction>>;
/**
 * 注文内容を照会する
 */
export declare function makeInquiryAboutOrder(orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey): ActionOperation<monapt.Option<OrderFactory.IOrder>>;
/**
 * 取引を期限切れにする
 */
export declare function makeExpired(): (actionAdapter: ActionAdapter) => Promise<void>;
/**
 * ひとつの取引のタスクをエクスポートする
 *
 * @param {ActionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
export declare function exportTasks(status: ActionStatus): TaskAndActionOperation<void>;
/**
 * ID指定で取引のタスク出力
 */
export declare function exportTasksById(actionId: string): TaskAndActionOperation<TaskFactory.ITask[]>;
/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export declare function reexportTasks(intervalInMinutes: number): (actionAdapter: ActionAdapter) => Promise<void>;
