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
export declare function create(args: {
    id?: string;
    name: TaskName;
    status: TaskStatus;
    runsAt: Date;
    remainingNumberOfTries: number;
    lastTriedAt: Date | null;
    numberOfTried: number;
    executionResults: TaskExecutionResult.ITaskExecutionResult[];
    data: any;
}): ITask;
