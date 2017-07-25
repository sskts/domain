/**
 * 座席予約承認資産移動ファクトリー
 *
 * @namespace factory/task/settleSeatReservation
 */

import * as TaskFactory from '../task';
import * as TaskExecutionResult from '../taskExecutionResult';
import TaskName from '../taskName';
import TaskStatus from '../taskStatus';
import * as PlaceOrderTransactionFactory from '../transaction/placeOrder';

export interface IData {
    transaction: PlaceOrderTransactionFactory.ITransaction;
}

export interface ITask extends TaskFactory.ITask {
    data: IData;
}

export function create(args: {
    id?: string;
    status: TaskStatus;
    runsAt: Date;
    remainingNumberOfTries: number;
    lastTriedAt: Date | null;
    numberOfTried: number;
    executionResults: TaskExecutionResult.ITaskExecutionResult[];
    data: IData;
}): ITask {
    // todo validation

    return TaskFactory.create({ ...args, ...{ name: TaskName.SettleSeatReservation } });
}
