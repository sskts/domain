import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterOrganizationFactory from '../factory/organization/movieTheater';
import OrganizationAdapter from '../adapter/organization';
export declare type IOrganizationOperation<T> = (organizationAdapter: OrganizationAdapter) => Promise<T>;
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
     * 組織ID
     */
    id: string;
    /**
     * 場所
     */
    location: MovieTheaterOrganizationFactory.ILocation;
    /**
     * 組織名称
     */
    name: IMultilingualString;
    /**
     * 組織URL
     */
    url: string;
}
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IOrganizationOperation<ISearchMovieTheaterResult[]>;
