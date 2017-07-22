import ActionStatusType from './actionStatusType';
import ActionTasksExportationStatus from './actionTasksExportationStatus';
import * as TaskFactory from './task';
export interface IAction {
    id: string;
    typeOf: string;
    actionStatus: ActionStatusType;
    agent: any;
    result?: any;
    error?: any;
    object?: any;
    expires: Date;
    startDate?: Date;
    endDate?: Date;
    /**
     * タスクエクスポート日時
     */
    tasksExportedAt?: Date;
    /**
     * タスクエクスポート状態
     */
    tasksExportationStatus: ActionTasksExportationStatus;
    /**
     * タスクリスト
     */
    tasks: TaskFactory.ITask[];
}
/**
 * 取引を作成する
 *
 * @export
 * @returns {ITransaction} 取引
 * @memberof factory/transaction
 */
export declare function create(args: {
    id?: string;
    typeOf: string;
    actionStatus: ActionStatusType;
    agent: any;
    result?: any;
    error?: any;
    object?: any;
    expires: Date;
    startDate?: Date;
    endDate?: Date;
    tasksExportedAt?: Date;
    tasksExportationStatus?: ActionTasksExportationStatus;
    tasks?: TaskFactory.ITask[];
}): IAction;
