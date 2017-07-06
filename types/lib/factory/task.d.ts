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
export declare function create(args: {
    id?: string;
    name: TaskName;
    status: TaskStatus;
    runs_at: Date;
    remaining_number_of_tries: number;
    last_tried_at: Date | null;
    number_of_tried: number;
    execution_results: TaskExecutionResult.ITaskExecutionResult[];
    data: any;
}): ITask;
