/**
 * 販売情報サービス
 */
import * as createDebug from 'debug';

import { MongoRepository as EventRepository } from '../repo/event';
import { MongoRepository as ScreeningEventItemAvailabilityRepo } from '../repo/itemAvailability/screeningEvent';

import * as factory from '../factory';

const debug = createDebug('sskts-domain:service:offer');

export type IEventOperation<T> = (repos: {
    event: EventRepository;
    itemAvailability?: ScreeningEventItemAvailabilityRepo;
}) => Promise<T>;

/**
 * 個々の上映イベントを検索する
 * 在庫状況リポジトリをパラメーターとして渡せば、在庫状況も取得してくれる
 */
export function searchIndividualScreeningEvents(
    searchConditions: factory.event.screeningEvent.ISearchConditions
): IEventOperation<factory.event.screeningEvent.IEvent[]> {
    return async (repos: {
        event: EventRepository;
        itemAvailability?: ScreeningEventItemAvailabilityRepo;
    }) => {
        debug('finding screeningEvents...', searchConditions);
        const events = await repos.event.searchIndividualScreeningEvents(searchConditions);

        return Promise.all(events.map(async (event) => {
            // 必ず定義されている前提
            const coaInfo = <factory.event.screeningEvent.ICOAInfo>event.coaInfo;

            // 空席状況情報を追加
            const offer: factory.event.screeningEvent.IOffer4cinemasunshine = {
                typeOf: 'Offer',
                availability: null,
                url: ''
            };
            // tslint:disable-next-line:no-single-line-block-comment
            /* istanbul ignore else */
            if (repos.itemAvailability !== undefined) {
                offer.availability = await repos.itemAvailability.findOne(coaInfo.dateJouei, event.identifier);
            }

            return {
                ...event,
                offer: offer, //  本来不要だが、互換性維持のため
                offers: offer
            };
        }));
    };
}

/**
 * 個々の上映イベントを識別子で取得する
 */
export function findIndividualScreeningEventByIdentifier(
    id: string
): IEventOperation<factory.event.screeningEvent.IEvent> {
    return async (repos: {
        event: EventRepository;
        itemAvailability?: ScreeningEventItemAvailabilityRepo;
    }) => {
        const event = await repos.event.findById({
            typeOf: factory.chevre.eventType.ScreeningEvent,
            id: id
        });

        // 必ず定義されている前提
        const coaInfo = <factory.event.screeningEvent.ICOAInfo>event.coaInfo;

        // add item availability info
        const offer: factory.event.screeningEvent.IOffer4cinemasunshine = {
            typeOf: 'Offer',
            availability: null,
            url: ''
        };
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore else */
        if (repos.itemAvailability !== undefined) {
            offer.availability = await repos.itemAvailability.findOne(coaInfo.dateJouei, event.identifier);
        }

        return {
            ...event,
            offer: offer, //  本来不要だが、互換性維持のため
            offers: offer
        };
    };
}
