import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import { MongoRepository as EventRepo } from '../../repo/event';
import { MongoRepository as PlaceRepo } from '../../repo/place';

import * as MasterSyncService from '../masterSync';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.ImportScreeningEvents>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        const eventRepo = new EventRepo(settings.connection);
        const placeRepo = new PlaceRepo(settings.connection);

        await MasterSyncService.importScreeningEvents(
            data.locationBranchCode,
            data.importFrom,
            data.importThrough,
            data.xmlEndPoint
        )({
            event: eventRepo,
            place: placeRepo
        });
    };
}
