import monapt = require("monapt");
import FilmRepository from "../../repository/film";
import PerformanceRepository from "../../repository/performance";
import ScreenRepository from "../../repository/screen";
import TheaterRepository from "../../repository/theater";
import MasterService from "../master";
import COA = require("@motionpicture/coa-service");
import * as FilmFactory from "../../factory/film";
import * as PerformanceFactory from "../../factory/performance";
import * as ScreenFactory from "../../factory/screen";
import * as TheaterFactory from "../../factory/theater";
import Film from "../../model/film";
import MultilingualString from "../../model/multilingualString";
import Performance from "../../model/performance";
import Screen from "../../model/screen";
import Theater from "../../model/theater";

export type TheaterOperation<T> = (repository: TheaterRepository) => Promise<T>;
export type FilmOperation<T> = (repository: FilmRepository) => Promise<T>;
export type ScreenOperation<T> = (repository: ScreenRepository) => Promise<T>;
export type PerformanceOperation<T> = (repository: PerformanceRepository) => Promise<T>;
export type TheaterAndScreenOperation<T> = (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => Promise<T>;
export type TheaterAndFilmOperation<T> = (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => Promise<T>;
export type FilmAndScreenAndPerformanceOperation<T> =
    (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => Promise<T>;

export interface SearchPerformancesConditions {
    day?: string;
    theater?: string;
}
export interface SearchPerformancesResult {
    _id: string;
    theater: {
        _id: string;
        name: MultilingualString;
    };
    screen: {
        _id: string;
        name: MultilingualString;
    };
    film: {
        _id: string;
        name: MultilingualString;
    };
    day: string;
    time_start: string;
    time_end: string;
    canceled: boolean;
}

/**
 * マスタサービス
 *
 *
 * @class MasterServiceInterpreter
 * @implements {MasterService}
 */
export default class MasterServiceInterpreter implements MasterService {
    /**
     * 劇場インポート
     *
     * @param {string} theaterCode
     * @returns {TheaterOperation<void>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public importTheater(theaterCode: string): TheaterOperation<void> {
        return async (repository: TheaterRepository) => {
            // COAから取得
            const theaterFromCOA = await COA.findTheaterInterface.call({
                theater_code: theaterCode,
            });

            // 永続化
            const theater = TheaterFactory.createFromCOA(theaterFromCOA);
            await repository.store(theater);
        };
    }

    /**
     * 作品インポート
     *
     * @param {string} theaterCode
     * @returns {TheaterAndFilmOperation<void>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public importFilms(theaterCode: string): TheaterAndFilmOperation<void> {
        return async (theaterRepository: TheaterRepository, filmRepository: FilmRepository) => {
            // 劇場取得
            const optionTheater = await theaterRepository.findById(theaterCode);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            // COAから作品取得
            const films = await COA.findFilmsByTheaterCodeInterface.call({
                theater_code: theaterCode,
            });

            // 永続化
            await Promise.all(films.map(async (filmFromCOA) => {
                const film = await FilmFactory.createFromCOA(filmFromCOA)(optionTheater.get());
                await filmRepository.store(film);
            }));
        };
    }

    /**
     * スクリーンインポート
     *
     * @param {string} theaterCode
     * @returns {TheaterAndScreenOperation<void>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public importScreens(theaterCode: string): TheaterAndScreenOperation<void> {
        return async (theaterRepository: TheaterRepository, screenRepository: ScreenRepository) => {
            // 劇場取得
            const optionTheater = await theaterRepository.findById(theaterCode);
            if (optionTheater.isEmpty) throw new Error("theater not found.");

            // COAからスクリーン取得
            const screens = await COA.findScreensByTheaterCodeInterface.call({
                theater_code: theaterCode,
            });

            // 永続化
            await Promise.all(screens.map(async (screenFromCOA) => {
                const screen = await ScreenFactory.createFromCOA(screenFromCOA)(optionTheater.get());
                await screenRepository.store(screen);
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
     * @memberOf MasterServiceInterpreter
     */
    public importPerformances(theaterCode: string, dayStart: string, dayEnd: string): FilmAndScreenAndPerformanceOperation<void> {
        return async (filmRepository: FilmRepository, screenRepository: ScreenRepository, performanceRepository: PerformanceRepository) => {
            // スクリーン取得
            const screens = await screenRepository.findByTheater({ theater_id: theaterCode });

            // COAからパフォーマンス取得
            const performances = await COA.findPerformancesByTheaterCodeInterface.call({
                theater_code: theaterCode,
                begin: dayStart,
                end: dayEnd,
            });

            // パフォーマンスごとに永続化トライ
            await Promise.all(performances.map(async (performanceFromCOA) => {
                const screenId = `${theaterCode}${performanceFromCOA.screen_code}`;
                const filmId = `${theaterCode}${performanceFromCOA.title_code}${performanceFromCOA.title_branch_num}`;

                // スクリーン存在チェック
                const _screen = screens.find((screen) => (screen._id === screenId));
                if (!_screen) throw new Error(("screen not found."));

                // 作品取得
                const optionFilm = await filmRepository.findById(filmId);
                if (optionFilm.isEmpty) throw new Error("film not found.");

                // 永続化
                const performance = PerformanceFactory.createFromCOA(performanceFromCOA)(_screen, optionFilm.get());
                await performanceRepository.store(performance);
            }));
        };
    }

    /**
     * パフォーマンス検索
     *
     * @param {SearchPerformancesConditions} conditions
     * @returns {PerformanceOperation<Array<SearchPerformancesResult>>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public searchPerformances(conditions: SearchPerformancesConditions): PerformanceOperation<SearchPerformancesResult[]> {
        return async (performanceRepository: PerformanceRepository): Promise<SearchPerformancesResult[]> => {
            // 検索条件を作成
            const andConditions: Object[] = [
                { _id: { $ne: null } },
            ];

            if (conditions.day) {
                andConditions.push({ day: conditions.day });
            }

            if (conditions.theater) {
                andConditions.push({ theater: conditions.theater });
            }

            const performances = await performanceRepository.find({ $and: andConditions });

            // TODO 空席状況を追加

            return performances.map((performance) => {
                return {
                    _id: performance._id,
                    theater: {
                        _id: performance.theater._id,
                        name: performance.theater.name,
                    },
                    screen: {
                        _id: performance.screen._id,
                        name: performance.screen.name,
                    },
                    film: {
                        _id: performance.film._id,
                        name: performance.film.name,
                    },
                    day: performance.day,
                    time_start: performance.time_start,
                    time_end: performance.time_end,
                    canceled: performance.canceled,
                };
            });
        };
    }

    /**
     * IDで劇場検索
     *
     * @param {string} theaterId
     * @returns {TheaterOperation<monapt.Option<Theater>>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public findTheater(theaterId: string): TheaterOperation<monapt.Option<Theater>> {
        return async (repository: TheaterRepository) => {
            return await repository.findById(theaterId);
        };
    }

    /**
     * IDで作品検索
     *
     * @param {string} filmId
     * @returns {FilmOperation<monapt.Option<Film>>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public findFilm(filmId: string): FilmOperation<monapt.Option<Film>> {
        return async (repository: FilmRepository) => {
            return await repository.findById(filmId);
        };
    }

    /**
     *
     *
     * @param {string} screenId
     * @returns {ScreenOperation<monapt.Option<Screen>>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public findScreen(screenId: string): ScreenOperation<monapt.Option<Screen>> {
        return async (repository: ScreenRepository) => {
            return await repository.findById(screenId);
        };
    }

    /**
     * IDでパフォーマンス検索
     *
     * @param {string} performanceId
     * @returns {PerformanceOperation<monapt.Option<Performance>>}
     *
     * @memberOf MasterServiceInterpreter
     */
    public findPerformance(performanceId: string): PerformanceOperation<monapt.Option<Performance>> {
        return async (repository: PerformanceRepository) => {
            return await repository.findById(performanceId);
        };
    }
}