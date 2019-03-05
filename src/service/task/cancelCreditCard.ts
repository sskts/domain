import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as PaymentService from '../payment';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.CancelCreditCard>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const actionRepo = new repository.Action(settings.connection);
        await PaymentService.creditCard.cancelCreditCardAuth(data)({ action: actionRepo });
    };
}
