import * as factory from '@motionpicture/sskts-factory';
import * as moment from 'moment';
import { Connection } from 'mongoose';
import eventModel from './mongoose/model/event';

/**
 * イベント抽象リポジトリー
 */
export abstract class Repository {
    public abstract async saveScreeningEventSeries(event: factory.event.screeningEventSeries.IEvent): Promise<void>;
    public abstract async saveScreeningEvent(screeningEvent: factory.event.screeningEvent.IEvent): Promise<void>;
    public abstract async saveIndividualScreeningEvent(
        individualScreeningEvent: factory.event.individualScreeningEvent.IEvent
    ): Promise<void>;
    public abstract async cancelIndividualScreeningEvent(identifier: string): Promise<void>;
    public abstract async searchIndividualScreeningEvents(
        searchConditions: factory.event.individualScreeningEvent.ISearchConditions
    ): Promise<factory.event.individualScreeningEvent.IEvent[]>;
    public abstract async findIndividualScreeningEventByIdentifier(
        identifier: string
    ): Promise<factory.event.individualScreeningEvent.IEvent>;
}

/**
 * イベントリポジトリー
 */
export class MongoRepository implements Repository {
    public readonly eventModel: typeof eventModel;

    constructor(connection: Connection) {
        this.eventModel = connection.model(eventModel.modelName);
    }

    public static CREATE_INDIVIDUAL_SCREENING_EVENT_MONGO_CONDITIONS(
        searchConditions: factory.event.individualScreeningEvent.ISearchConditions
    ) {
        // dayプロパティがあればstartFrom & startThroughに変換(互換性維持のため)
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if ((<any>searchConditions).day !== undefined) {
            searchConditions.startFrom = moment(`${(<any>searchConditions).day} +09:00`, 'YYYYMMDD Z').toDate();
            searchConditions.startThrough = moment(`${(<any>searchConditions).day} +09:00`, 'YYYYMMDD Z').add(1, 'day').toDate();
        }

        // MongoDB検索条件
        const andConditions: any[] = [
            {
                typeOf: factory.eventType.IndividualScreeningEvent
            }
        ];

        // theaterプロパティがあればbranchCodeで検索(互換性維持のため)
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if ((<any>searchConditions).theater !== undefined) {
            andConditions.push({
                'superEvent.location.branchCode': {
                    $exists: true,
                    $eq: (<any>searchConditions).theater
                }
            });
        }

        // 場所の識別子条件
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(searchConditions.superEventLocationIdentifiers)) {
            andConditions.push({
                'superEvent.location.identifier': {
                    $exists: true,
                    $in: searchConditions.superEventLocationIdentifiers
                }
            });
        }

        // イベントステータス条件
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(searchConditions.eventStatuses)) {
            andConditions.push({
                eventStatus: { $in: searchConditions.eventStatuses }
            });
        }

        // 作品識別子条件
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (Array.isArray(searchConditions.workPerformedIdentifiers)) {
            andConditions.push({
                'workPerformed.identifier': {
                    $exists: true,
                    $in: searchConditions.workPerformedIdentifiers
                }
            });
        }

        // 開始日時条件
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.startFrom !== undefined) {
            andConditions.push({
                startDate: { $gte: searchConditions.startFrom }
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.startThrough !== undefined) {
            andConditions.push({
                startDate: { $lt: searchConditions.startThrough }
            });
        }

        // 終了日時条件
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.endFrom !== undefined) {
            andConditions.push({
                endDate: { $gte: searchConditions.endFrom }
            });
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.endThrough !== undefined) {
            andConditions.push({
                endDate: { $lt: searchConditions.endThrough }
            });
        }

        return andConditions;
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
            {
                $set: { ...screeningEvent },
                $setOnInsert: { _id: screeningEvent.id }
            },
            { new: true, upsert: true }
        ).exec();
    }

    /**
     * 上映イベントシリーズを保管する
     */
    public async saveScreeningEventSeries(event: factory.event.screeningEventSeries.IEvent) {
        await this.eventModel.findOneAndUpdate(
            {
                identifier: event.identifier,
                typeOf: factory.eventType.ScreeningEventSeries
            },
            {
                $set: { ...event },
                $setOnInsert: { _id: event.id }
            },
            { new: true, upsert: true }
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
            {
                $set: { ...individualScreeningEvent },
                $setOnInsert: { _id: individualScreeningEvent.id }
            },
            { new: true, upsert: true }
        ).exec();
    }

    /**
     * 上映イベントをキャンセルする
     * @param identifier イベント識別子
     */
    public async cancelIndividualScreeningEvent(identifier: string) {
        await this.eventModel.findOneAndUpdate(
            {
                identifier: identifier,
                typeOf: factory.eventType.IndividualScreeningEvent
            },
            { eventStatus: factory.eventStatusType.EventCancelled },
            { new: true }
        ).exec();
    }

    public async countIndividualScreeningEvents(params: factory.event.individualScreeningEvent.ISearchConditions): Promise<number> {
        const conditions = MongoRepository.CREATE_INDIVIDUAL_SCREENING_EVENT_MONGO_CONDITIONS(params);

        return this.eventModel.countDocuments(
            { $and: conditions }
        ).setOptions({ maxTimeMS: 10000 })
            .exec();
    }

    /**
     * 個々の上映イベントを検索する
     */
    public async searchIndividualScreeningEvents(
        params: factory.event.individualScreeningEvent.ISearchConditions
    ): Promise<factory.event.individualScreeningEvent.IEvent[]> {
        const conditions = MongoRepository.CREATE_INDIVIDUAL_SCREENING_EVENT_MONGO_CONDITIONS(params);
        const query = this.eventModel.find(
            { $and: conditions },
            {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            }
        );
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.limit !== undefined && params.page !== undefined) {
            query.limit(params.limit).skip(params.limit * (params.page - 1));
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (params.sort !== undefined) {
            query.sort(params.sort);
        }

        return query.setOptions({ maxTimeMS: 10000 }).exec().then((docs) => docs.map((doc) => doc.toObject()));
    }

    /**
     * identifierで上映イベントを取得する
     */
    public async findIndividualScreeningEventByIdentifier(identifier: string): Promise<factory.event.individualScreeningEvent.IEvent> {
        const doc = await this.eventModel.findOne(
            {
                typeOf: factory.eventType.IndividualScreeningEvent,
                identifier: identifier
            },
            {
                __v: 0,
                createdAt: 0,
                updatedAt: 0
            }
        ).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('individualScreeningEvent');
        }

        return doc.toObject();
    }
}
