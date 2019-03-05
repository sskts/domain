
import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as DeliveryService from '../delivery';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.SendOrder>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.redisClient === undefined) {
            throw new Error('settings.redisClient undefined.');
        }

        const actionRepo = new repository.Action(settings.connection);
        const orderRepo = new repository.Order(settings.connection);
        const ownershipInfoRepo = new repository.OwnershipInfo(settings.connection);
        const transactionRepo = new repository.Transaction(settings.connection);
        const taskRepo = new repository.Task(settings.connection);
        await DeliveryService.sendOrder(data)({
            action: actionRepo,
            order: orderRepo,
            ownershipInfo: ownershipInfoRepo,
            registerActionInProgressRepo: new repository.action.RegisterProgramMembershipInProgress(settings.redisClient),
            transaction: transactionRepo,
            task: taskRepo
        });
    };
}
