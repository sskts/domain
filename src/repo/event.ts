
import * as factory from '@motionpicture/sskts-factory';
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

    /**
     * save a screening event
     * 上映イベントを保管する
     * @param screeningEvent screeningEvent object
     */
    public async saveScreeningEvent(screeningEvent: factory.event.screeningEvent.IEvent) {
        await this.eventModel.findOneAndUpdate(
            {
                identifier: screeningEvent.identifier,
                typeOf: factory.eventType.ScreeningEvent
            },
            screeningEvent,
            { upsert: true }
        ).exec();
    }

    /**
     * save a individual screening event
     * 個々の上映イベントを保管する
     * @param individualScreeningEvent individualScreeningEvent object
     */
    public async saveIndividualScreeningEvent(individualScreeningEvent: factory.event.individualScreeningEvent.IEvent) {
        await this.eventModel.findOneAndUpdate(
            {
                identifier: individualScreeningEvent.identifier,
                typeOf: factory.eventType.IndividualScreeningEvent
            },
            individualScreeningEvent,
            { new: true, upsert: true }
        ).exec();
    }
}
