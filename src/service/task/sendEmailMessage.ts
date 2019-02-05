
import { service } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';
import { MongoRepository as ActionRepo } from '../../repo/action';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.SendEmailMessage>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const actionRepo = new ActionRepo(settings.connection);
        await service.notification.sendEmailMessage(data.actionAttributes)({ action: actionRepo });
    };
}
