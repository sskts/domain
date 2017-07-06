/**
 * マスタサービス
 *
 * @namespace service/master
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import * as FilmFactory from '../factory/film';
import IMultilingualString from '../factory/multilingualString';
import * as PerformanceFactory from '../factory/performance';
import * as ScreenFactory from '../factory/screen';
import * as PerformanceStockStatusFactory from '../factory/stockStatus/performance';
import * as TheaterFactory from '../factory/theater';

import FilmAdapter from '../adapter/film';
import PerformanceAdapter from '../adapter/performance';
import ScreenAdapter from '../adapter/screen';
import PerformanceStockStatusAdapter from '../adapter/stockStatus/performance';
import TheaterAdapter from '../adapter/theater';

export type TheaterOperation<T> = (adapter: TheaterAdapter) => Promise<T>;
export type FilmOperation<T> = (adapter: FilmAdapter) => Promise<T>;
export type ScreenOperation<T> = (adapter: ScreenAdapter) => Promise<T>;
export type PerformanceOperation<T> = (adapter: PerformanceAdapter) => Promise<T>;
export type PerformanceAndPerformanceStockStatusOperation<T> =
    (performanceAdapter: PerformanceAdapter, performanceStockStatusAdapter?: PerformanceStockStatusAdapter) => Promise<T>;
export type TheaterAndScreenOperation<T> =
    (theaterRepo: TheaterAdapter, screenRepo: ScreenAdapter) => Promise<T>;
export type TheaterAndFilmOperation<T> =
    (theaterRepo: TheaterAdapter, filmRepo: FilmAdapter) => Promise<T>;
export type FilmAndScreenAndPerformanceOperation<T> =
    (filmRepo: FilmAdapter, screenRepo: ScreenAdapter, performanceRepo: PerformanceAdapter) => Promise<T>;

export interface ISearchTheatersConditions {
    name?: string;
}
export type ISearchTheatersResult = TheaterFactory.IRequiredFields & TheaterFactory.IOptionalFields;

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
export function importTheater(theaterCode: string): TheaterOperation<void> {
    return async (adapter: TheaterAdapter) => {
        // COAから取得
        const theaterFromCOA = await COA.services.master.theater({
            theater_code: theaterCode
        });

        // 永続化
        const requiredFields = TheaterFactory.createFromCOA(theaterFromCOA);
        const initialOptionalFields = TheaterFactory.createInitialOptionalFields();
        debug('storing theater...', requiredFields, initialOptionalFields);
        await adapter.model.findByIdAndUpdate(
            requiredFields.id,
            {
                $set: requiredFields,
                $setOnInsert: initialOptionalFields // insertの場合はオプショナルな値を初期値としてセット
            },
            { new: true, upsert: true }
        ).exec();
        debug('theater stored.');
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
export function importFilms(theaterCode: string): TheaterAndFilmOperation<void> {
    return async (theaterAdapter: TheaterAdapter, filmRepo: FilmAdapter) => {
        // 劇場取得
        const doc = await theaterAdapter.model.findById(theaterCode).exec();
        if (doc === null) {
            throw new ArgumentError('theater not found.');
        }
        const theater = <TheaterFactory.ITheater>doc.toObject();

        // COAから作品取得
        const films = await COA.services.master.title({
            theater_code: theaterCode
        });

        // 永続化
        await Promise.all(films.map(async (filmFromCOA) => {
            const film = FilmFactory.createFromCOA(filmFromCOA)(theater);
            debug('storing film...', film);
            await filmRepo.model.findByIdAndUpdate(film.id, film, { new: true, upsert: true }).exec();
            debug('film stored.');
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
export function importScreens(theaterCode: string): TheaterAndScreenOperation<void> {
    return async (theaterAdapter: TheaterAdapter, screenRepo: ScreenAdapter) => {
        // 劇場取得
        const doc = await theaterAdapter.model.findById(theaterCode).exec();
        if (doc === null) {
            throw new ArgumentError('theater not found.');
        }
        const theater = <TheaterFactory.ITheater>doc.toObject();

        // COAからスクリーン取得
        const screens = await COA.services.master.screen({
            theater_code: theaterCode
        });

        // 永続化
        await Promise.all(screens.map(async (screenFromCOA) => {
            const screen = ScreenFactory.createFromCOA(screenFromCOA)(theater);
            debug('storing screen...');
            await screenRepo.model.findByIdAndUpdate(screen.id, screen, { new: true, upsert: true }).exec();
            debug('screen stored.');
        }));
    };
}

/**
 * パフォーマンスインポート
 *
 * @param {string} theaterCode
 * @param {string} dayStart
 * @param {string} dayEnd
 * @returns {FilmAndScreenAndPerformanceOperation<void>}
 *
 * @memberof service/master
 */
export function importPerformances(theaterCode: string, dayStart: string, dayEnd: string):
    FilmAndScreenAndPerformanceOperation<void> {
    return async (
        filmRepo: FilmAdapter,
        screenRepo: ScreenAdapter,
        performanceRepo: PerformanceAdapter
    ) => {
        // スクリーン取得
        const docs = await screenRepo.model.find({ theater: theaterCode })
            .setOptions({ maxTimeMS: 10000 })
            .exec();
        const screens = docs.map((doc) => <ScreenFactory.IScreen>doc.toObject());
        debug('screens:', screens);

        // COAからパフォーマンス取得
        const performances = await COA.services.master.schedule({
            theater_code: theaterCode,
            begin: dayStart,
            end: dayEnd
        });

        // パフォーマンスごとに永続化トライ
        await Promise.all(performances.map(async (performanceFromCOA) => {
            const screenId = `${theaterCode}${performanceFromCOA.screen_code}`;
            const filmId = `${theaterCode}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;

            // スクリーン存在チェック
            const screenOfPerformance = screens.find((screen) => (screen.id === screenId));
            if (screenOfPerformance === undefined) {
                console.error('screen not found.', screenId);

                return;
            }

            // 作品取得
            const doc = await filmRepo.model.findById(filmId).exec();
            if (doc === null) {
                console.error('film not found.', filmId);

                return;
            }
            const film = <FilmFactory.IFilm>doc.toObject();

            // 永続化
            const performance = PerformanceFactory.createFromCOA(performanceFromCOA)(screenOfPerformance, film);
            debug('storing performance', performance);
            await performanceRepo.model.findByIdAndUpdate(performance.id, performance, { new: true, upsert: true }).exec();
            debug('performance stored.');
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
export function searchTheaters(searchConditions: ISearchTheatersConditions): TheaterOperation<ISearchTheatersResult[]> {
    return async (theaterAdapter: TheaterAdapter): Promise<ISearchTheatersResult[]> => {
        // 検索条件を作成
        const conditions: any = {};
        debug('searchConditions:', searchConditions);

        // todo 検索条件を指定できるように改修

        debug('finding performances...', conditions);
        const docs = await theaterAdapter.model.find(conditions, 'id name name_kana address websites')
            .setOptions({ maxTimeMS: 10000 })
            .exec();

        const theaters: ISearchTheatersResult[] = [];
        await Promise.all(docs.map(async (doc) => {
            theaters.push({
                id: doc.get('id'),
                name: doc.get('name'),
                name_kana: doc.get('name_kana'),
                address: doc.get('address'),
                websites: doc.get('websites')
            });
        }));

        return theaters;
    };
}

/**
 * パフォーマンス検索
 * 空席状況情報がなかったバージョンに対して互換性を保つために
 * performanceStockStatusAdapterはundefinedでも使えるようになっている
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceAndPerformanceStockStatusOperation<ISearchPerformancesResult[]>}
 *
 * @memberof service/master
 */
export function searchPerformances(searchConditions: ISearchPerformancesConditions):
    PerformanceAndPerformanceStockStatusOperation<ISearchPerformancesResult[]> {
    return async (
        performanceRepo: PerformanceAdapter,
        performanceStockStatusAdapter?: PerformanceStockStatusAdapter
    ): Promise<ISearchPerformancesResult[]> => {
        // 検索条件を作成
        const conditions: any = {};

        if (searchConditions.day !== undefined) {
            conditions.day = searchConditions.day;
        }

        if (searchConditions.theater !== undefined) {
            conditions.theater = searchConditions.theater;
        }

        debug('finding performances...', conditions);
        const docs = await performanceRepo.model.find(conditions)
            .setOptions({ maxTimeMS: 10000 })
            .populate('film', '_id name minutes')
            .populate('theater', '_id name')
            .populate('screen', '_id name')
            .exec();

        const performances: ISearchPerformancesResult[] = [];
        await Promise.all(docs.map(async (doc) => {
            // 空席状況を追加
            let stockStatus = null;
            if (performanceStockStatusAdapter !== undefined) {
                stockStatus = await performanceStockStatusAdapter.findOne(doc.get('day'), doc.get('id'));
                debug('stockStatus:', stockStatus);
            }

            performances.push({
                id: doc.get('id'),
                theater: {
                    id: doc.get('theater').id,
                    name: doc.get('theater').name
                },
                screen: {
                    id: doc.get('screen').id,
                    name: doc.get('screen').name
                },
                film: {
                    id: doc.get('film').id,
                    name: doc.get('film').name,
                    minutes: doc.get('film').minutes
                },
                day: doc.get('day'),
                time_start: doc.get('time_start'),
                time_end: doc.get('time_end'),
                canceled: doc.get('canceled'),
                stock_status: (stockStatus === null) ? null : stockStatus.expression
            });
        }));

        return performances;
    };
}

/**
 * IDで劇場検索
 *
 * @param {string} theaterId
 * @returns {TheaterOperation<monapt.Option<Theater>>}
 *
 * @memberof service/master
 */
export function findTheater(theaterId: string): TheaterOperation<monapt.Option<TheaterFactory.ITheater>> {
    debug('finding a theater...', theaterId);

    return async (adapter: TheaterAdapter) => {
        const doc = await adapter.model.findById(theaterId).exec();

        return (doc === null) ? monapt.None : monapt.Option(<TheaterFactory.ITheater>doc.toObject());
    };
}

/**
 * IDで作品検索
 *
 * @param {string} filmId
 * @returns {FilmOperation<monapt.Option<Film>>}
 *
 * @memberof service/master
 */
export function findFilm(filmId: string): FilmOperation<monapt.Option<FilmFactory.IFilm>> {
    debug('finding a film...', filmId);

    return async (adapter: FilmAdapter) => {
        const doc = await adapter.model.findById(filmId).exec();

        return (doc === null) ? monapt.None : monapt.Option(<FilmFactory.IFilm>doc.toObject());
    };
}

/**
 *
 *
 * @param {string} screenId
 * @returns {ScreenOperation<monapt.Option<Screen>>}
 *
 * @memberof service/master
 */
export function findScreen(screenId: string): ScreenOperation<monapt.Option<ScreenFactory.IScreen>> {
    debug('finding a screen...', screenId);

    return async (adapter: ScreenAdapter) => {
        const doc = await adapter.model.findById(screenId).exec();

        return (doc === null) ? monapt.None : monapt.Option(<ScreenFactory.IScreen>doc.toObject());
    };
}

/**
 * IDでパフォーマンス検索
 *
 * @param {string} performanceId
 * @returns {PerformanceOperation<monapt.Option<Performance>>}
 *
 * @memberof service/master
 */
export function findPerformance(
    performanceId: string
): PerformanceOperation<monapt.Option<PerformanceFactory.IPerformanceWithReferenceDetails>> {
    debug('finding a performance...', performanceId);

    return async (adapter: PerformanceAdapter) => {
        const doc = await adapter.model.findById(performanceId)
            .populate('film')
            .populate('theater', 'name name_kana address')
            .populate('screen', 'name')
            .exec();

        return (doc === null) ? monapt.None : monapt.Option(<PerformanceFactory.IPerformanceWithReferenceDetails>doc.toObject());
    };
}
