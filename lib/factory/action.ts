/**
 * `アクションファクトリー
 *
 * @namespace factory/action
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

import ActionStatusType from './actionStatusType';
import ActionTasksExportationStatus from './actionTasksExportationStatus';
import ObjectId from './objectId';
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
export function create(args: {
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
}): IAction {
    if (_.isEmpty(args.actionStatus)) throw new ArgumentNullError('actionStatus');
    if (!_.isDate(args.expires)) throw new ArgumentError('expires', 'expires should be Date');

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        typeOf: args.typeOf,
        actionStatus: args.actionStatus,
        agent: args.agent,
        result: args.result,
        error: args.error,
        object: args.object,
        expires: args.expires,
        startDate: args.startDate,
        endDate: args.endDate,
        tasksExportedAt: args.tasksExportedAt,
        // tslint:disable-next-line:max-line-length
        tasksExportationStatus: (args.tasksExportationStatus === undefined) ? ActionTasksExportationStatus.Unexported : args.tasksExportationStatus,
        tasks: (args.tasks === undefined) ? [] : args.tasks
    };
}
