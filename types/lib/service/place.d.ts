import * as monapt from 'monapt';
import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterPlaceFactory from '../factory/place/movieTheater';
import PlaceAdapter from '../adapter/place';
export declare type IPlaceOperation<T> = (placeAdapter: PlaceAdapter) => Promise<T>;
/**
 * 劇場インポート
 */
export declare function importMovieTheater(theaterCode: string): IPlaceOperation<void>;
export interface ISearchMovieTheatersConditions {
    name?: string;
}
export interface ISearchMovieTheaterResult {
    branchCode: string;
    name: IMultilingualString;
    kanaName: string;
    sameAs?: string;
}
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IPlaceOperation<ISearchMovieTheaterResult[]>;
/**
 * 枝番号で劇場検索
 */
export declare function findMovieTheaterByBranchCode(branchCode: string): IPlaceOperation<monapt.Option<MovieTheaterPlaceFactory.IPlace>>;
