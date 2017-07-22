import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';

/**
 * イベントアダプター
 *
 * @class EventAdapter
 */
export default class EventAdapter {
    public readonly eventModel: typeof eventModel;

    constructor(connection: Connection) {
        this.eventModel = connection.model(eventModel.modelName);
    }
}
