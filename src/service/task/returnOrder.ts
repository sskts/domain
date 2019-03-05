
import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as OrderService from '../order';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.ReturnOrder>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const actionRepo = new repository.Action(settings.connection);
        const orderRepo = new repository.Order(settings.connection);
        const ownershipInfoRepo = new repository.OwnershipInfo(settings.connection);
        const transactionRepo = new repository.Transaction(settings.connection);
        const taskRepo = new repository.Task(settings.connection);
        await OrderService.returnOrder(data)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            transaction: transactionRepo,
            task: taskRepo
        });
    };
}
