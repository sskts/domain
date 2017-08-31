import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';

/**
 * イベントレポジトリー
 *
 * @class EventRepository
 */
export default class EventRepository {
    public readonly eventModel: typeof eventModel;

    constructor(connection: Connection) {
        this.eventModel = connection.model(eventModel.modelName);
    }
}
