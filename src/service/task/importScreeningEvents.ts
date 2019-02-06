import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import { MongoRepository as EventRepo } from '../../repo/event';
import { MongoRepository as PlaceRepo } from '../../repo/place';
import { MongoRepository as SellerRepo } from '../../repo/seller';

import * as MasterSyncService from '../masterSync';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.ImportScreeningEvents>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const eventRepo = new EventRepo(settings.connection);
        const placeRepo = new PlaceRepo(settings.connection);
        const sellerRepo = new SellerRepo(settings.connection);

        await MasterSyncService.importScreeningEvents(data)({
            event: eventRepo,
            place: placeRepo,
            seller: sellerRepo
        });
    };
}
