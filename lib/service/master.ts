/**
 * マスタサービス
 *
 * @namespace service/master
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import * as MovieFactory from '../factory/creativeWork/movie';
import CreativeWorkType from '../factory/creativeWorkType';
import * as IndivisualScreeningEventFactory from '../factory/event/indivisualScreeningEvent';
import * as ScreeningEventFactory from '../factory/event/screeningEvent';
import EventType from '../factory/eventType';
import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterPlaceFactory from '../factory/place/movieTheater';
import PlaceType from '../factory/placeType';
import * as PerformanceStockStatusFactory from '../factory/stockStatus/performance';

import CreativeWorkAdapter from '../adapter/creativeWork';
import EventAdapter from '../adapter/event';
import PlaceAdapter from '../adapter/place';
// import PerformanceStockStatusAdapter from '../adapter/stockStatus/performance';

export interface ISearchTheatersConditions {
    name?: string;
}

export interface ISearchPerformancesConditions {
    day?: string;
    theater?: string;
}
export interface ISearchPerformancesResult {
    id: string;
    theater: {
        id: string;
        name: IMultilingualString;
    };
    screen: {
        id: string;
        name: IMultilingualString;
    };
    film: {
        id: string;
        name: IMultilingualString;
        minutes: number;
    };
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
    stock_status: PerformanceStockStatusFactory.Expression | null;
}

const debug = createDebug('sskts-domain:service:master');

/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberof service/master
 */
export function importMovieTheater(theaterCode: string) {
    return async (placeAdapter: PlaceAdapter) => {
        // COAから取得
        const theaterFromCOA = await COA.services.master.theater({
            theater_code: theaterCode
        });

        // COAからスクリーン取得
        const screensFromCOA = await COA.services.master.screen({
            theater_code: theaterCode
        });

        // 永続化
        const movieTheater = MovieTheaterPlaceFactory.createFromCOA(theaterFromCOA, screensFromCOA);
        debug('storing movieTheater...', movieTheater);
        await placeAdapter.placeModel.findOneAndUpdate(
            {
                branchCode: movieTheater.branchCode
            },
            {
                $set: movieTheater
                // $setOnInsert: initialOptionalFields // insertの場合はオプショナルな値を初期値としてセット
            },
            { upsert: true }
        ).exec();
        debug('movieTheater stored.');
    };
}

/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberof service/master
 */
export function importMovies(theaterCode: string) {
    return async (
        creativeWorkAdapter: CreativeWorkAdapter,
        eventAdapter: EventAdapter,
        placeAdapter: PlaceAdapter
    ) => {
        // 劇場取得
        const movieTheaterDoc = await placeAdapter.placeModel.findOne(
            {
                branchCode: theaterCode,
                typeOf: PlaceType.MovieTheater
            }
        ).exec();
        if (movieTheaterDoc === null) {
            throw new ArgumentError('movieTheater not found.');
        }
        const movieTheater = <MovieTheaterPlaceFactory.IPlace>movieTheaterDoc.toObject();

        // COAから作品取得
        const films = await COA.services.master.title({
            theater_code: theaterCode
        });

        // 永続化
        await Promise.all(films.map(async (filmFromCOA) => {
            const movie = MovieFactory.createFromCOA(filmFromCOA);
            debug('storing movie...', movie);
            await creativeWorkAdapter.creativeWorkModel.findOneAndUpdate(
                {
                    identifier: movie.identifier,
                    typeOf: CreativeWorkType.Movie
                },
                movie,
                { upsert: true }
            ).exec();
            debug('movie stored.');

            const screeningEvent = ScreeningEventFactory.createFromCOA(filmFromCOA)(movieTheater);
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            await eventAdapter.eventModel.findOneAndUpdate(
                {
                    identifier: screeningEvent.identifier,
                    typeOf: EventType.ScreeningEvent
                },
                screeningEvent,
                { upsert: true }
            ).exec();
            debug('screeningEvent stored.');
        }));
    };
}

/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberof service/master
 */
// export function importScreens(theaterCode: string): TheaterAndScreenOperation<void> {
//     return async (theaterAdapter: TheaterAdapter, screenRepo: ScreenAdapter) => {
//         // 劇場取得
//         const doc = await theaterAdapter.model.findById(theaterCode).exec();
//         if (doc === null) {
//             throw new ArgumentError('theater not found.');
//         }
//         const theater = <TheaterOrganizationFactory.IOrganization>doc.toObject();

//         // COAからスクリーン取得
//         const screens = await COA.services.master.screen({
//             theater_code: theaterCode
//         });

//         // 永続化
//         await Promise.all(screens.map(async (screenFromCOA) => {
//             const screen = ScreenFactory.createFromCOA(screenFromCOA)(theater);
//             debug('storing screen...');
//             await screenRepo.model.findByIdAndUpdate(screen.id, screen, { new: true, upsert: true }).exec();
//             debug('screen stored.');
//         }));
//     };
// }

/**
 * 個々の上映会イベントインポート
 *
 * @memberof service/master
 */
export function importIndivisualScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date) {
    return async (
        eventAdapter: EventAdapter,
        placeAdapter: PlaceAdapter
    ) => {
        // 劇場取得
        const placeDoc = await placeAdapter.placeModel.findOne(
            {
                branchCode: theaterCode,
                typeOf: PlaceType.MovieTheater
            }
        ).exec();
        if (placeDoc === null) {
            throw new ArgumentError('theater not found.');
        }
        const movieTheater = <MovieTheaterPlaceFactory.IPlace>placeDoc.toObject();

        // COAからパフォーマンス取得
        const performances = await COA.services.master.schedule({
            theater_code: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });

        // パフォーマンスごとに永続化トライ
        await Promise.all(performances.map(async (performanceFromCOA) => {
            const screeningEventIdentifier = ScreeningEventFactory.createIdentifier(
                theaterCode, performanceFromCOA.title_code, performanceFromCOA.title_branch_num
            );

            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find(
                (place) => place.branchCode === performanceFromCOA.screen_code
            );
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', performanceFromCOA.screen_code);

                return;
            }

            // 上映イベント取得
            const screeningEventDoc = await eventAdapter.eventModel.findOne(
                {
                    identifier: screeningEventIdentifier,
                    typeOf: EventType.ScreeningEvent
                }
            ).exec();
            if (screeningEventDoc === null) {
                console.error('screeningEvent not found.', screeningEventIdentifier);

                return;
            }
            const screeningEvent = <ScreeningEventFactory.IEvent>screeningEventDoc.toObject();

            // 永続化
            const indivisualScreeningEvent = IndivisualScreeningEventFactory.createFromCOA(performanceFromCOA)(screenRoom, screeningEvent);
            debug('storing indivisualScreeningEvent', indivisualScreeningEvent);
            await eventAdapter.eventModel.findOneAndUpdate(
                {
                    identifier: indivisualScreeningEvent.identifier,
                    typeOf: EventType.IndivisualScreeningEvent
                },
                indivisualScreeningEvent,
                { new: true, upsert: true }
            ).exec();
            debug('indivisualScreeningEvent stored.');
        }));
    };
}

/**
 * 劇場検索
 *
 * @param {ISearchTheatersConditions} searchConditions
 * @returns {TheaterOperation<ISearchTheatersResult[]>}
 *
 * @memberof service/master
 */
export function searchMovieTheaters(searchConditions: ISearchTheatersConditions) {
    return async (placeAdapter: PlaceAdapter) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: PlaceType.MovieTheater
        };
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding performances...', conditions);
        const placeDocs = await placeAdapter.placeModel.find(conditions, 'branchCode name kanaName sameAs')
            .setOptions({ maxTimeMS: 10000 })
            .exec();

        return placeDocs.map((doc) => {
            const movieTheater = <MovieTheaterPlaceFactory.IPlace>doc.toObject();

            return {
                branchCode: movieTheater.branchCode,
                name: movieTheater.name,
                kanaName: movieTheater.kanaName,
                sameAs: movieTheater.sameAs
            };
        });
    };
}

/**
 * 上映イベント検索
 * 空席状況情報がなかったバージョンに対して互換性を保つために
 * performanceStockStatusAdapterはundefinedでも使えるようになっている
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceAndPerformanceStockStatusOperation<ISearchPerformancesResult[]>}
 *
 * @memberof service/master
 */
export function searchIndivisualScreeningEvents(searchConditions: ISearchPerformancesConditions) {
    return async (
        eventAdapter: EventAdapter
        // performanceStockStatusAdapter?: PerformanceStockStatusAdapter
    ) => {
        // 検索条件を作成
        const conditions: any = {
            typeOf: EventType.IndivisualScreeningEvent
        };

        if (searchConditions.day !== undefined) {
            conditions.startDate = {
                $gte: moment(searchConditions.day, 'YYYYMMDD').toDate(),
                $lt: moment(searchConditions.day, 'YYYYMMDD').add(1, 'day').toDate()
            };
        }

        if (searchConditions.theater !== undefined) {
            conditions['superEvent.location.branchCode'] = searchConditions.theater;
        }

        debug('finding indivisualScreeningEvents...', conditions);

        return <IndivisualScreeningEventFactory.IEvent>await eventAdapter.eventModel.find(conditions)
            .setOptions({ maxTimeMS: 10000 })
            // .populate('film', '_id name minutes')
            // .populate('theater', '_id name')
            // .populate('screen', '_id name')
            .lean()
            .exec();

        // const performances: ISearchPerformancesResult[] = [];
        // await Promise.all(docs.map(async (doc) => {
        //     // 空席状況を追加
        //     let stockStatus = null;
        //     if (performanceStockStatusAdapter !== undefined) {
        //         stockStatus = await performanceStockStatusAdapter.findOne(doc.get('day'), doc.get('id'));
        //         debug('stockStatus:', stockStatus);
        //     }

        //     performances.push({
        //         id: doc.get('id'),
        //         theater: {
        //             id: doc.get('theater').id,
        //             name: doc.get('theater').name
        //         },
        //         screen: {
        //             id: doc.get('screen').id,
        //             name: doc.get('screen').name
        //         },
        //         film: {
        //             id: doc.get('film').id,
        //             name: doc.get('film').name,
        //             minutes: doc.get('film').minutes
        //         },
        //         day: doc.get('day'),
        //         time_start: doc.get('time_start'),
        //         time_end: doc.get('time_end'),
        //         canceled: doc.get('canceled'),
        //         stock_status: (stockStatus === null) ? null : stockStatus.expression
        //     });
        // }));

        // return performances;
    };
}

/**
 * 枝番号で劇場検索
 */
export function findTMovieTheaterByBranchCode(branchCode: string) {
    return async (placeAdapter: PlaceAdapter) => {
        const movieTheater = <MovieTheaterPlaceFactory.IPlace>await placeAdapter.placeModel.findOne({
            typeOf: PlaceType.MovieTheater,
            branchCode: branchCode
        }).lean().exec();

        return (movieTheater === null) ? monapt.None : monapt.Option(movieTheater);
    };
}

/**
 * IDで上映イベント検索
 */
export function findIndivisualScreeningEventByIdentifier(identifier: string) {
    return async (eventAdapter: EventAdapter) => {
        const event = <IndivisualScreeningEventFactory.IEvent>await eventAdapter.eventModel.findOne({
            typeOf: EventType.IndivisualScreeningEvent,
            identifier: identifier
        }).lean().exec();

        return (event === null) ? monapt.None : monapt.Option(event);
    };
}
