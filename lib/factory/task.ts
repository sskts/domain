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
    runsAt: Date;
    /**
     * あと何回トライできるか
     *
     * @type {number}
     * @memberof ITask
     */
    remainingNumberOfTries: number;
    /**
     * 最終トライ日時
     *
     * @type {(Date | null)}
     * @memberof ITask
     */
    lastTriedAt: Date | null;
    /**
     * すでにトライした回数
     *
     * @type {number}
     * @memberof ITask
     */
    numberOfTried: number;
    /**
     * 実行結果リスト
     *
     * @type {TaskExecutionResult.ITaskExecutionResult[]}
     * @memberof ITask
     */
    executionResults: TaskExecutionResult.ITaskExecutionResult[];
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
    runsAt: Date;
    remainingNumberOfTries: number;
    lastTriedAt: Date | null;
    numberOfTried: number;
    executionResults: TaskExecutionResult.ITaskExecutionResult[];
    data: any;
}): ITask {
    // todo validation
    if (_.isEmpty(args.status)) {
        throw new ArgumentNullError('status');
    }
    if (!_.isDate(args.runsAt)) {
        throw new ArgumentError('runsAt', 'runsAt should be Date');
    }
    if (!_.isNumber(args.remainingNumberOfTries)) {
        throw new ArgumentError('remainingNumberOfTries', 'remainingNumberOfTries should be number');
    }
    if (!_.isNull(args.lastTriedAt) && !_.isDate(args.lastTriedAt)) {
        throw new ArgumentError('lastTriedAt', 'lastTriedAt should be Date or null');
    }
    if (!_.isNumber(args.numberOfTried)) {
        throw new ArgumentError('numberOfTried', 'numberOfTried should be number');
    }
    if (!_.isArray(args.executionResults)) {
        throw new ArgumentError('executionResults', 'executionResults should be array');
    }

    return {
        id: (args.id === undefined) ? ObjectId().toString() : args.id,
        name: args.name,
        status: args.status,
        runsAt: args.runsAt,
        remainingNumberOfTries: args.remainingNumberOfTries,
        lastTriedAt: args.lastTriedAt,
        numberOfTried: args.numberOfTried,
        executionResults: args.executionResults,
        data: args.data
    };
}
