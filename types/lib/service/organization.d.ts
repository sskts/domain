import IMultilingualString from '../factory/multilingualString';
import * as MovieTheaterOrganizationFactory from '../factory/organization/movieTheater';
import OrganizationAdapter from '../adapter/organization';
export declare type IOrganizationOperation<T> = (organizationAdapter: OrganizationAdapter) => Promise<T>;
export interface ISearchMovieTheatersConditions {
    name?: string;
}
export interface ISearchMovieTheaterResult {
    typeOf: string;
    id: string;
    location: MovieTheaterOrganizationFactory.ILocation;
    name: IMultilingualString;
    url: string;
}
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IOrganizationOperation<ISearchMovieTheaterResult[]>;
