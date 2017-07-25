/**
 * GMO承認解除タスクファクトリー
 *
 * @namespace factory/task/cancelGMO
 */
import * as TaskFactory from '../task';
import * as TaskExecutionResult from '../taskExecutionResult';
import TaskStatus from '../taskStatus';
import * as PlaceOrderTransactionFactory from '../transaction/placeOrder';
export interface IData {
    transaction: PlaceOrderTransactionFactory.ITransaction;
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
