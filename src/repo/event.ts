
import * as factory from '@motionpicture/sskts-factory';
import * as moment from 'moment';
import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';

export abstract class Repository {
    public abstract async saveScreeningEvent(screeningEvent: factory.event.screeningEvent.IEvent): Promise<void>;
    public abstract async saveIndividualScreeningEvent(
        individualScreeningEvent: factory.event.individualScreeningEvent.IEvent
    ): Promise<void>;
}

/**
 * イベントレポジトリー
 *
 * @class EventRepository
 */
export class MongoRepository implements Repository {
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

    public async searchIndividualScreeningEvents(
        searchConditions: factory.event.individualScreeningEvent.ISearchConditions
    ): Promise<factory.event.individualScreeningEvent.IEvent[]> {
        const conditions: any = {
            typeOf: factory.eventType.IndividualScreeningEvent
        };

        if (searchConditions.day !== undefined) {
            conditions.startDate = {
                $gte: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').toDate(),
                $lt: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').add(1, 'day').toDate()
            };
        }

        if (searchConditions.theater !== undefined) {
            conditions['superEvent.location.branchCode'] = searchConditions.theater;
        }

        return <factory.event.individualScreeningEvent.IEvent[]>await this.eventModel.find(conditions)
            .sort({ startDate: 1 })
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();
    }

    public async findIndividualScreeningEventByIdentifier(identifier: string): Promise<factory.event.individualScreeningEvent.IEvent> {
        const event = await this.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();

        if (event === null) {
            throw new factory.errors.NotFound('individualScreeningEvent');
        }

        return <factory.event.individualScreeningEvent.IEvent>event;
    }
}
