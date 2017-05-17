import * as monapt from 'monapt';
import * as FilmFactory from '../factory/film';
import IMultilingualString from '../factory/multilingualString';
import * as PerformanceFactory from '../factory/performance';
import * as ScreenFactory from '../factory/screen';
import * as TheaterFactory from '../factory/theater';
import FilmAdapter from '../adapter/film';
import PerformanceAdapter from '../adapter/performance';
import ScreenAdapter from '../adapter/screen';
import TheaterAdapter from '../adapter/theater';
export declare type TheaterOperation<T> = (adapter: TheaterAdapter) => Promise<T>;
export declare type FilmOperation<T> = (adapter: FilmAdapter) => Promise<T>;
export declare type ScreenOperation<T> = (adapter: ScreenAdapter) => Promise<T>;
export declare type PerformanceOperation<T> = (adapter: PerformanceAdapter) => Promise<T>;
export declare type TheaterAndScreenOperation<T> = (theaterRepo: TheaterAdapter, screenRepo: ScreenAdapter) => Promise<T>;
export declare type TheaterAndFilmOperation<T> = (theaterRepo: TheaterAdapter, filmRepo: FilmAdapter) => Promise<T>;
export declare type FilmAndScreenAndPerformanceOperation<T> = (filmRepo: FilmAdapter, screenRepo: ScreenAdapter, performanceRepo: PerformanceAdapter) => Promise<T>;
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
    };
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}
/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberof service/master
 */
export declare function importTheater(theaterCode: string): TheaterOperation<void>;
/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberof service/master
 */
export declare function importFilms(theaterCode: string): TheaterAndFilmOperation<void>;
/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberof service/master
 */
export declare function importScreens(theaterCode: string): TheaterAndScreenOperation<void>;
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
export declare function importPerformances(theaterCode: string, dayStart: string, dayEnd: string): FilmAndScreenAndPerformanceOperation<void>;
/**
 * パフォーマンス検索
 *
 * @param {SearchPerformancesConditions} conditions
 * @returns {PerformanceOperation<Array<SearchPerformancesResult>>}
 *
 * @memberof service/master
 */
export declare function searchPerformances(searchConditions: ISearchPerformancesConditions): PerformanceOperation<ISearchPerformancesResult[]>;
/**
 * IDで劇場検索
 *
 * @param {string} theaterId
 * @returns {TheaterOperation<monapt.Option<Theater>>}
 *
 * @memberof service/master
 */
export declare function findTheater(theaterId: string): TheaterOperation<monapt.Option<TheaterFactory.ITheater>>;
/**
 * IDで作品検索
 *
 * @param {string} filmId
 * @returns {FilmOperation<monapt.Option<Film>>}
 *
 * @memberof service/master
 */
export declare function findFilm(filmId: string): FilmOperation<monapt.Option<FilmFactory.IFilm>>;
/**
 *
 *
 * @param {string} screenId
 * @returns {ScreenOperation<monapt.Option<Screen>>}
 *
 * @memberof service/master
 */
export declare function findScreen(screenId: string): ScreenOperation<monapt.Option<ScreenFactory.IScreen>>;
/**
 * IDでパフォーマンス検索
 *
 * @param {string} performanceId
 * @returns {PerformanceOperation<monapt.Option<Performance>>}
 *
 * @memberof service/master
 */
export declare function findPerformance(performanceId: string): PerformanceOperation<monapt.Option<PerformanceFactory.IPerformanceWithReferenceDetails>>;
