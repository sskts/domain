
import { repository, service } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.ConfirmReservation>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const actionRepo = new repository.Action(settings.connection);

        await service.reservation.confirmReservation(<any>data)({
            action: actionRepo,
            reserveService: <any>null //  シネマサンシャインではchevreを使用しないので、いったん問題ない
        });
    };
}
