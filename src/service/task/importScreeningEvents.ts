import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as MasterSyncService from '../masterSync';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.ImportScreeningEvents>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const eventRepo = new repository.Event(settings.connection);
        const placeRepo = new repository.Place(settings.connection);
        const sellerRepo = new repository.Seller(settings.connection);

        await MasterSyncService.importScreeningEvents(data)({
            event: eventRepo,
            place: placeRepo,
            seller: sellerRepo
        });
    };
}
