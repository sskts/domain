
import * as factory from '@motionpicture/sskts-factory';
import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';

/**
 * イベント抽象リポジトリー
 * @class
 * @abstract
 */
export abstract class Repository {
    public abstract async saveScreeningEvent(screeningEvent: factory.event.screeningEvent.IEvent): Promise<void>;
    public abstract async saveIndividualScreeningEvent(
        individualScreeningEvent: factory.event.individualScreeningEvent.IEvent
    ): Promise<void>;
}

/**
 * イベントレポジトリー
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

    /**
     * 個々の上映イベントを検索する
     * @param {Object} searchConditions 検索条件
     */
    public async searchIndividualScreeningEvents(
        searchConditions: {
            branchCode?: string;
            startFrom?: Date;
            startThrough?: Date;
        }
    ): Promise<factory.event.individualScreeningEvent.IEvent[]> {
        const andConditions: any[] = [
            {
                typeOf: factory.eventType.IndividualScreeningEvent
            }
        ];

        if (searchConditions.branchCode !== undefined) {
            andConditions.push({
                'superEvent.location.branchCode': searchConditions.branchCode
            });
        }

        if (searchConditions.startFrom !== undefined) {
            andConditions.push({
                startDate: { $gte: searchConditions.startFrom }
            });
        }
        if (searchConditions.startThrough !== undefined) {
            andConditions.push({
                startDate: { $lt: searchConditions.startThrough }
            });
        }

        return <factory.event.individualScreeningEvent.IEvent[]>await this.eventModel.find({ $and: andConditions })
            .sort({ startDate: 1 })
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();
    }

    /**
     * identifierで上映イベントを取得する
     * @param {string} identifier
     */
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
