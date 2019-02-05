import { service } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.TriggerWebhook>): IOperation<void> {
    return async (_: IConnectionSettings) => {
        await service.notification.triggerWebhook(data)();
    };
}
