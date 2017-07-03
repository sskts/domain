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
    runs_at: Date;
    max_number_of_try: number;
    last_tried_at: Date | null;
    number_of_tried: number;
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
    max_number_of_try: number;
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
    if (!_.isNumber(args.max_number_of_try)) {
        throw new ArgumentError('max_number_of_try', 'max_number_of_try should be number');
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
        max_number_of_try: args.max_number_of_try,
        last_tried_at: args.last_tried_at,
        number_of_tried: args.number_of_tried,
        execution_results: args.execution_results,
        data: args.data
    };
}
