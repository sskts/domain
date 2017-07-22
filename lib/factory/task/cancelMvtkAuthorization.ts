/**
 * ムビチケ承認解除タスクファクトリー
 *
 * @namespace factory/task/cancelMvtkAuthorization
 */

import * as MvtkAuthorizationFactory from '../authorization/mvtk';
import * as TaskFactory from '../task';
import * as TaskExecutionResult from '../taskExecutionResult';
import TaskName from '../taskName';
import TaskStatus from '../taskStatus';

export interface IData {
    authorization: MvtkAuthorizationFactory.IAuthorization;
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

    return TaskFactory.create({ ...args, ...{ name: TaskName.CancelMvtkAuthorization } });
}
