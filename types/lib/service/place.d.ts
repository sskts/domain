import * as monapt from 'monapt';
import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterPlaceFactory from '../factory/place/movieTheater';
import PlaceAdapter from '../adapter/place';
export declare type IPlaceOperation<T> = (placeAdapter: PlaceAdapter) => Promise<T>;
/**
 * 劇場インポート
 */
export declare function importMovieTheater(theaterCode: string): IPlaceOperation<void>;
/**
 * 劇場検索条件インターフェース
 */
export interface ISearchMovieTheatersConditions {
    name?: string;
}
/**
 * 劇場検索結果インターフェース
 */
export interface ISearchMovieTheaterResult {
    /**
     * スキーマタイプ
     */
    typeOf: string;
    /**
     * 枝番号
     */
    branchCode: string;
    /**
     * 劇場名称
     */
    name: IMultilingualString;
    /**
     * 劇場カナ名称
     */
    kanaName: string;
    /**
     * 劇場URL
     */
    url?: string;
}
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IPlaceOperation<ISearchMovieTheaterResult[]>;
/**
 * 枝番号で劇場検索
 */
export declare function findMovieTheaterByBranchCode(branchCode: string): IPlaceOperation<monapt.Option<MovieTheaterPlaceFactory.IPlace>>;
