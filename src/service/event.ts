/**
 * event service
 * イベントサービス
 * @namespace service/event
 */

import * as COA from '@motionpicture/coa-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import EventAdapter from '../adapter/event';
import IndividualScreeningEventItemAvailabilityAdapter from '../adapter/itemAvailability/individualScreeningEvent';
import PlaceAdapter from '../adapter/place';

const debug = createDebug('sskts-domain:service:event');
// const kubunClasses = [
//     {
//         kubunCode: '001',
//         kubunName: 'パッケージ区分'
//     },
//     {
//         kubunCode: '002',
//         kubunName: '座席印刷区分'
//     },
//     {
//         kubunCode: '003',
//         kubunName: '日計処理切替区分'
//     },
//     {
//         kubunCode: '004',
//         kubunName: '消費税'
//     },
//     {
//         kubunCode: '005',
//         kubunName: '販売区分'
//     },
//     {
//         kubunCode: '006',
//         kubunName: 'ドロワインタフェース'
//     },
//     {
//         kubunCode: '007',
//         kubunName: '座席指定区分'
//     },
//     {
//         kubunCode: '008',
//         kubunName: 'チケット種別'
//     },
//     {
//         kubunCode: '009',
//         kubunName: 'サービス区分'
//     },
//     {
//         kubunCode: '010',
//         kubunName: 'チケット発券単位'
//     },
//     {
//         kubunCode: '011',
//         kubunName: 'チケット制限区分'
//     },
//     {
//         kubunCode: '012',
//         kubunName: '割引区分'
//     },
//     {
//         kubunCode: '013',
//         kubunName: 'メッセージ区分'
//     },
//     {
//         kubunCode: '014',
//         kubunName: 'サブシステム区分'
//     },
//     {
//         kubunCode: '015',
//         kubunName: '曜日'
//     },
//     {
//         kubunCode: '016',
//         kubunName: '会員割引区分'
//     },
//     {
//         kubunCode: '017',
//         kubunName: '座席番号表示区分'
//     },
//     {
//         kubunCode: '018',
//         kubunName: '座席表示色'
//     },
//     {
//         kubunCode: '019',
//         kubunName: '予約券発券区分'
//     },
//     {
//         kubunCode: '020',
//         kubunName: 'チケット印刷パターン'
//     },
//     {
//         kubunCode: '021',
//         kubunName: '担当者認証タイプ'
//     },
//     {
//         kubunCode: '022',
//         kubunName: '消費税丸め区分'
//     },
//     {
//         kubunCode: '023',
//         kubunName: '発券区分'
//     },
//     {
//         kubunCode: '024',
//         kubunName: '売上集計区分'
//     },
//     {
//         kubunCode: '025',
//         kubunName: 'クーポン区分'
//     },
//     {
//         kubunCode: '026',
//         kubunName: '使用可能権限'
//     },
//     {
//         kubunCode: '027',
//         kubunName: '座席位置区分縦'
//     },
//     {
//         kubunCode: '028',
//         kubunName: '座席位置区分横'
//     },
//     {
//         kubunCode: '029',
//         kubunName: 'ポイント加算区分'
//     },
//     {
//         kubunCode: '030',
//         kubunName: 'カード有効期限更新区分'
//     },
//     {
//         kubunCode: '031',
//         kubunName: '性別'
//     },
//     {
//         kubunCode: '032',
//         kubunName: '税計算区分'
//     },
//     {
//         kubunCode: '033',
//         kubunName: '内外税区分'
//     },
//     {
//         kubunCode: '034',
//         kubunName: '商品区分'
//     },
//     {
//         kubunCode: '035',
//         kubunName: '単価入力区分'
//     },
//     {
//         kubunCode: '036',
//         kubunName: '仕入区分'
//     },
//     {
//         kubunCode: '037',
//         kubunName: '支払区分'
//     },
//     {
//         kubunCode: '038',
//         kubunName: '入出庫区分'
//     },
//     {
//         kubunCode: '039',
//         kubunName: '天候'
//     },
//     {
//         kubunCode: '040',
//         kubunName: '商品種別'
//     },
//     {
//         kubunCode: '041',
//         kubunName: '伝票区分'
//     },
//     {
//         kubunCode: '042',
//         kubunName: '映像区分'
//     },
//     {
//         kubunCode: '043',
//         kubunName: '字幕吹替'
//     },
//     {
//         kubunCode: '044',
//         kubunName: '映倫区分'
//     },
//     {
//         kubunCode: '045',
//         kubunName: '上映方式'
//     },
//     {
//         kubunCode: '046',
//         kubunName: '音響区分'
//     },
//     {
//         kubunCode: '901',
//         kubunName: 'ムビチケ券種区分'
//     }
// ];

export type IEventOperation<T> = (
    eventAdapter: EventAdapter,
    itemAvailability?: IndividualScreeningEventItemAvailabilityAdapter
) => Promise<T>;

/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
export function importScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date) {
    // tslint:disable-next-line:max-func-body-length
    return async (eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => {
        // 劇場取得
        const movieTheaterDoc = await placeAdapter.placeModel.findOne(
            {
                branchCode: theaterCode,
                typeOf: factory.placeType.MovieTheater
            }
        ).exec();
        if (movieTheaterDoc === null) {
            throw new ArgumentError('movieTheater not found.');
        }
        const movieTheater = <factory.place.movieTheater.IPlace>movieTheaterDoc.toObject();

        // COAから作品取得
        const filmsFromCOA = await COA.services.master.title({
            theaterCode: theaterCode
        });

        // COAからパフォーマンス取得
        const schedulesFromCOA = await COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });

        // COAから区分マスター抽出
        const serviceKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '009'
        });
        const acousticKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '046'
        });
        const eirinKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '044'
        });
        const eizouKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '042'
        });
        const joueihousikiKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '045'
        });
        const jimakufukikaeKubuns = await COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '043'
        });
        debug(serviceKubuns, acousticKubuns, eirinKubuns, eizouKubuns, joueihousikiKubuns, jimakufukikaeKubuns);

        // 永続化
        const screeningEvents = await Promise.all(filmsFromCOA.map(async (filmFromCOA) => {
            const screeningEvent = factory.event.screeningEvent.createFromCOA({
                filmFromCOA: filmFromCOA,
                movieTheater: movieTheater,
                eirinKubuns: eirinKubuns,
                eizouKubuns: eizouKubuns,
                joueihousikiKubuns: joueihousikiKubuns,
                jimakufukikaeKubuns: jimakufukikaeKubuns
            });
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            await eventAdapter.eventModel.findOneAndUpdate(
                {
                    identifier: screeningEvent.identifier,
                    typeOf: factory.eventType.ScreeningEvent
                },
                screeningEvent,
                { upsert: true }
            ).exec();
            debug('screeningEvent stored.');

            return screeningEvent;
        }));

        // パフォーマンスごとに永続化トライ
        await Promise.all(schedulesFromCOA.map(async (scheduleFromCOA) => {
            const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier(
                theaterCode, scheduleFromCOA.titleCode, scheduleFromCOA.titleBranchNum
            );

            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find(
                (place) => place.branchCode === scheduleFromCOA.screenCode
            );
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', scheduleFromCOA.screenCode);

                return;
            }

            // 上映イベント取得
            const screeningEvent = screeningEvents.find((event) => event.identifier === screeningEventIdentifier);
            if (screeningEvent === undefined) {
                console.error('screeningEvent not found.', screeningEventIdentifier);

                return;
            }

            // 永続化
            const individualScreeningEvent = factory.event.individualScreeningEvent.createFromCOA({
                performanceFromCOA: scheduleFromCOA,
                screenRoom: screenRoom,
                screeningEvent: screeningEvent,
                serviceKubuns: serviceKubuns,
                acousticKubuns: acousticKubuns
            });
            debug('storing individualScreeningEvent', individualScreeningEvent);
            await eventAdapter.eventModel.findOneAndUpdate(
                {
                    identifier: individualScreeningEvent.identifier,
                    typeOf: factory.eventType.IndividualScreeningEvent
                },
                individualScreeningEvent,
                { new: true, upsert: true }
            ).exec();
            debug('individualScreeningEvent stored.');
        }));
    };
}

/**
 * search individualScreeningEvents
 * @export
 * @function
 * @memberof service/event
 */
export function searchIndividualScreeningEvents(
    searchConditions: factory.event.individualScreeningEvent.ISearchConditions
): IEventOperation<factory.event.individualScreeningEvent.IEventWithOffer[]> {
    return async (
        eventAdapter: EventAdapter,
        itemAvailabilityAdapter?: IndividualScreeningEventItemAvailabilityAdapter
    ) => {
        // 検索条件を作成
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

        debug('finding individualScreeningEvents...', conditions);
        const events = <factory.event.individualScreeningEvent.IEvent[]>await eventAdapter.eventModel.find(conditions)
            .sort({ startDate: 1 })
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();

        return await Promise.all(events.map(async (event) => {
            // add item availability info
            const offer: factory.event.individualScreeningEvent.IOffer = {
                typeOf: 'Offer',
                availability: null,
                url: ''
            };
            if (itemAvailabilityAdapter !== undefined) {
                offer.availability = await itemAvailabilityAdapter.findOne(event.coaInfo.dateJouei, event.identifier);
            }

            return {
                ...event,
                ...{
                    offer: offer
                }
            };
        }));
    };
}

/**
 * find individualScreeningEvent by identifier
 * @export
 * @function
 * @memberof service/event
 */
export function findIndividualScreeningEventByIdentifier(
    identifier: string
): IEventOperation<monapt.Option<factory.event.individualScreeningEvent.IEventWithOffer>> {
    return async (
        eventAdapter: EventAdapter,
        itemAvailabilityAdapter?: IndividualScreeningEventItemAvailabilityAdapter
    ) => {
        const event = <factory.event.individualScreeningEvent.IEvent>await eventAdapter.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();

        if (event === null) {
            return monapt.None;
        }

        // add item availability info
        const offer: factory.event.individualScreeningEvent.IOffer = {
            typeOf: 'Offer',
            availability: null,
            url: ''
        };
        if (itemAvailabilityAdapter !== undefined) {
            offer.availability = await itemAvailabilityAdapter.findOne(event.coaInfo.dateJouei, event.identifier);
        }

        return monapt.Option({
            ...event,
            ...{
                offer: offer
            }
        });
    };
}
