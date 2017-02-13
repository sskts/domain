import * as monapt from "monapt";
import FilmRepository from "../repository/film";
import PerformanceRepository from "../repository/performance";
import ScreenRepository from "../repository/screen";
import TheaterRepository from "../repository/theater";

import Film from "../model/film";
import MultilingualString from "../model/multilingualString";
import Performance from "../model/performance";
import Screen from "../model/screen";
import Theater from "../model/theater";

export type TheaterOperation<T> = (repository: TheaterRepository) => Promise<T>;
export type FilmOperation<T> = (repository: FilmRepository) => Promise<T>;
export type ScreenOperation<T> = (repository: ScreenRepository) => Promise<T>;
export type PerformanceOperation<T> = (repository: PerformanceRepository) => Promise<T>;
export type TheaterAndScreenOperation<T> =
    (theaterRepo: TheaterRepository, screenRepo: ScreenRepository) => Promise<T>;
export type TheaterAndFilmOperation<T> =
    (theaterRepo: TheaterRepository, filmRepo: FilmRepository) => Promise<T>;
export type FilmAndScreenAndPerformanceOperation<T> =
    (filmRepo: FilmRepository, screenRepo: ScreenRepository, performanceRepo: PerformanceRepository) => Promise<T>;

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
 * マスターサービス
 * マスターデータ(作品、劇場、スクリーン、パフォーマンスなど)をインポートしたり、検索したりするファンクション群
 *
 * @interface MasterService
 */
interface MasterService {
    importTheater(theaterCode: string): TheaterOperation<void>;
    importFilms(theaterCode: string): TheaterAndFilmOperation<void>;
    importScreens(theaterCode: string): TheaterAndScreenOperation<void>;
    importPerformances(theaterCode: string, dayStart: string, dayEnd: string):
        FilmAndScreenAndPerformanceOperation<void>;
    searchPerformances(conditions: SearchPerformancesConditions): PerformanceOperation<SearchPerformancesResult[]>;
    findTheater(theaterId: string): TheaterOperation<monapt.Option<Theater>>;
    findFilm(filmId: string): FilmOperation<monapt.Option<Film>>;
    findScreen(screenId: string): ScreenOperation<monapt.Option<Screen>>;
    findPerformance(performanceId: string): PerformanceOperation<monapt.Option<Performance>>;
}

export default MasterService;