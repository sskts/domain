import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as PaymentService from '../payment';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.RefundCreditCard>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const actionRepo = new repository.Action(settings.connection);
        const taskRepo = new repository.Task(settings.connection);
        await PaymentService.creditCard.refundCreditCard(data)({
            action: actionRepo,
            task: taskRepo
        });
    };
}
