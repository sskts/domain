/**
 * GMO承認資産移動タスクファクトリー
 *
 * @namespace factory/task/settleGMOAuthorization
 */
import * as GMOAuthorizationFactory from '../authorization/gmo';
import * as TaskFactory from '../task';
import * as TaskExecutionResult from '../taskExecutionResult';
import TaskStatus from '../taskStatus';
export interface IData {
    authorization: GMOAuthorizationFactory.IAuthorization;
}
export interface ITask extends TaskFactory.ITask {
    data: IData;
}
export declare function create(args: {
    id?: string;
    status: TaskStatus;
    runsAt: Date;
    remainingNumberOfTries: number;
    lastTriedAt: Date | null;
    numberOfTried: number;
    executionResults: TaskExecutionResult.ITaskExecutionResult[];
    data: IData;
}): ITask;
