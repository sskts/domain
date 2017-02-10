import monapt = require("monapt");
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
 * マスターサービス
 * マスターデータ(作品、劇場、スクリーン、パフォーマンスなど)をインポートしたり、検索したりするファンクション群
 *
 * @interface MasterService
 */
interface MasterService {
    /** 劇場インポート */
    importTheater(theaterCode: string): TheaterOperation<void>;
    /** 作品インポート */
    importFilms(theaterCode: string): TheaterAndFilmOperation<void>;
    /** スクリーンインポート */
    importScreens(theaterCode: string): TheaterAndScreenOperation<void>;
    /** パフォーマンスインポート */
    importPerformances(theaterCode: string, dayStart: string, dayEnd: string): FilmAndScreenAndPerformanceOperation<void>;
    // importSeatAvailability(theaterCode: string, dayStart: string, dayEnd: string): (repository: TheaterRepository) => Promise<void>;
    // importTickets(theaterCode: string): (repository: TheaterRepository) => Promise<void>;
    /** パフォーマンス検索 */
    searchPerformances(conditions: SearchPerformancesConditions): PerformanceOperation<SearchPerformancesResult[]>;
    /** 劇場詳細 */
    findTheater(theaterId: string): TheaterOperation<monapt.Option<Theater>>;
    /** 作品詳細 */
    findFilm(filmId: string): FilmOperation<monapt.Option<Film>>;
    /** スクリーン詳細 */
    findScreen(screenId: string): ScreenOperation<monapt.Option<Screen>>;
    /** パフォーマンス詳細 */
    findPerformance(performanceId: string): PerformanceOperation<monapt.Option<Performance>>;
}

export default MasterService;