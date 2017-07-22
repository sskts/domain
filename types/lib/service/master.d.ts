import * as monapt from 'monapt';
import * as IndivisualScreeningEventFactory from '../factory/event/indivisualScreeningEvent';
import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterPlaceFactory from '../factory/place/movieTheater';
import * as PerformanceStockStatusFactory from '../factory/stockStatus/performance';
import CreativeWorkAdapter from '../adapter/creativeWork';
import EventAdapter from '../adapter/event';
import PlaceAdapter from '../adapter/place';
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
/**
 * 劇場インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterOperation<void>}
 *
 * @memberof service/master
 */
export declare function importMovieTheater(theaterCode: string): (placeAdapter: PlaceAdapter) => Promise<void>;
/**
 * 作品インポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndFilmOperation<void>}
 *
 * @memberof service/master
 */
export declare function importMovies(theaterCode: string): (creativeWorkAdapter: CreativeWorkAdapter, eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => Promise<void>;
/**
 * スクリーンインポート
 *
 * @param {string} theaterCode
 * @returns {TheaterAndScreenOperation<void>}
 *
 * @memberof service/master
 */
/**
 * 個々の上映会イベントインポート
 *
 * @memberof service/master
 */
export declare function importIndivisualScreeningEvents(theaterCode: string, importFrom: Date, importThrough: Date): (eventAdapter: EventAdapter, placeAdapter: PlaceAdapter) => Promise<void>;
/**
 * 劇場検索
 *
 * @param {ISearchTheatersConditions} searchConditions
 * @returns {TheaterOperation<ISearchTheatersResult[]>}
 *
 * @memberof service/master
 */
export declare function searchMovieTheaters(searchConditions: ISearchTheatersConditions): (placeAdapter: PlaceAdapter) => Promise<{
    branchCode: string;
    name: IMultilingualString;
    kanaName: string;
    sameAs: string | undefined;
}[]>;
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
export declare function searchIndivisualScreeningEvents(searchConditions: ISearchPerformancesConditions): (eventAdapter: EventAdapter) => Promise<IndivisualScreeningEventFactory.IEvent>;
/**
 * 枝番号で劇場検索
 */
export declare function findTMovieTheaterByBranchCode(branchCode: string): (placeAdapter: PlaceAdapter) => Promise<monapt.Option<MovieTheaterPlaceFactory.IPlace>>;
/**
 * IDで上映イベント検索
 */
export declare function findIndivisualScreeningEventByIdentifier(identifier: string): (eventAdapter: EventAdapter) => Promise<monapt.Option<IndivisualScreeningEventFactory.IEvent>>;
