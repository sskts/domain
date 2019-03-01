import { repository } from '@cinerino/domain';

import * as moment from 'moment';

import * as factory from '../factory';

export type IEvent = factory.event.screeningEvent.IEvent | factory.event.screeningEventSeries.IEvent;

/**
 * イベントリポジトリ
 */
export class MongoRepository extends repository.Event {
    // tslint:disable-next-line:max-func-body-length
    public static CREATE_INDIVIDUAL_SCREENING_EVENT_MONGO_CONDITIONS(
        searchConditions: factory.event.screeningEvent.ISearchConditions
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
                typeOf: {
                    $in: [factory.eventType.IndividualScreeningEvent, factory.eventType.ScreeningEvent]
                }
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
        if (Array.isArray((<any>searchConditions).superEventLocationIdentifiers)) {
            // identifierはv28.0.0で廃止したが、互換性維持のため、branchCodeでの検索に変換
            andConditions.push({
                'superEvent.location.branchCode': {
                    $exists: true,
                    $in: (<any>searchConditions).superEventLocationIdentifiers.map((identifire: string) => {
                        return identifire.toString().replace('MovieTheater-', '');
                    })
                }
            });
        }

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (searchConditions.superEvent !== undefined) {
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(searchConditions.superEvent.ids)) {
                andConditions.push({
                    'superEvent.id': {
                        $exists: true,
                        $in: searchConditions.superEvent.ids
                    }
                });
            }
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(searchConditions.superEvent.locationBranchCodes)) {
                andConditions.push({
                    'superEvent.location.branchCode': {
                        $exists: true,
                        $in: searchConditions.superEvent.locationBranchCodes
                    }
                });
            }
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (Array.isArray(searchConditions.superEvent.workPerformedIdentifiers)) {
                andConditions.push({
                    'superEvent.workPerformed.identifier': {
                        $exists: true,
                        $in: searchConditions.superEvent.workPerformedIdentifiers
                    }
                });
            }
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
        if (Array.isArray((<any>searchConditions).workPerformedIdentifiers)) {
            andConditions.push({
                'workPerformed.identifier': {
                    $exists: true,
                    $in: (<any>searchConditions).workPerformedIdentifiers
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
     * 上映イベントをキャンセルする
     */
    public async cancelIndividualScreeningEvent(id: string) {
        await this.eventModel.findOneAndUpdate(
            {
                _id: id,
                typeOf: {
                    $in: [factory.eventType.IndividualScreeningEvent, factory.eventType.ScreeningEvent]
                }
            },
            { eventStatus: factory.eventStatusType.EventCancelled },
            { new: true }
        ).exec();
    }

    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore next */
    public async countIndividualScreeningEvents(params: factory.event.screeningEvent.ISearchConditions): Promise<number> {
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
        params: factory.event.screeningEvent.ISearchConditions
    ): Promise<factory.event.screeningEvent.IEvent[]> {
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
}
