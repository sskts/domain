/**
 * タスクファクトリー
 *
 * @namespace factory/task
 */

import * as _ from 'underscore';

import ArgumentError from '../error/argument';
import ArgumentNullError from '../error/argumentNull';

import ObjectId from './objectId';
import * as TaskExecutionResult from './taskExecutionResult';
import TaskName from './taskName';
import TaskStatus from './taskStatus';

export interface ITask {
    id: string;
    name: TaskName;
    status: TaskStatus;
    /**
     * いつ実行するか
     *
     * @type {Date}
     * @memberof ITask
     */
    runs_at: Date;
    /**
     * あと何回トライできるか
     *
     * @type {number}
     * @memberof ITask
     */
    remaining_number_of_tries: number;
    /**
     * 最終トライ日時
     *
     * @type {(Date | null)}
     * @memberof ITask
     */
    last_tried_at: Date | null;
    /**
     * すでにトライした回数
     *
     * @type {number}
     * @memberof ITask
     */
    number_of_tried: number;
    /**
     * 実行結果リスト
     *
     * @type {TaskExecutionResult.ITaskExecutionResult[]}
     * @memberof ITask
     */
    execution_results: TaskExecutionResult.ITaskExecutionResult[];
    /**
     * データ
     * TaskNameによってインターフェースが決定する
     *
     * @type {*}
     * @memberof ITask
     */
    data: any;
}

export function create(args: {
    id?: string;
    name: TaskName;
    status: TaskStatus;
    runs_at: Date;
    remaining_number_of_tries: number;
    last_tried_at: Date | null;
    number_of_tried: number;
    execution_results: TaskExecutionResult.ITaskExecutionResult[];
    data: any;
}): ITask {
    // todo validation
    if (_.isEmpty(args.status)) {
        throw new ArgumentNullError('status');
    }
    if (!_.isDate(args.runs_at)) {
        throw new ArgumentError('runs_at', 'run_at should be Date');
    }
    if (!_.isNumber(args.remaining_number_of_tries)) {
        throw new ArgumentError('remaining_number_of_tries', 'remaining_number_of_tries should be number');
    }
    if (!_.isNull(args.last_tried_at) && !_.isDate(args.last_tried_at)) {
        throw new ArgumentError('last_tried_at', 'last_tried_at should be Date or null');
    }
    if (!_.isNumber(args.number_of_tried)) {
        throw new ArgumentError('number_of_tried', 'number_of_tried should be number');
    }
    if (!_.isArray(args.execution_results)) {
        throw new ArgumentError('execution_results', 'execution_results should be array');
    }

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        name: args.name,
        status: args.status,
        runs_at: args.runs_at,
        remaining_number_of_tries: args.remaining_number_of_tries,
        last_tried_at: args.last_tried_at,
        number_of_tried: args.number_of_tried,
        execution_results: args.execution_results,
        data: args.data
    };
}
