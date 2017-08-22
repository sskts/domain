/**
 * 組織サービス
 *
 * @namespace service/organization
 */
import * as factory from '@motionpicture/sskts-factory';
import * as monapt from 'monapt';
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
export declare type IMovieTheater = factory.organization.movieTheater.IOrganizationWithoutGMOInfo & {
    /**
     * GMO情報
     */
    gmoInfo: {
        shopId: string;
    };
};
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: ISearchMovieTheatersConditions): IOrganizationOperation<IMovieTheater[]>;
/**
 * 枝番号で劇場検索
 */
export declare function findMovieTheaterByBranchCode(branchCode: string): IOrganizationOperation<monapt.Option<IMovieTheater>>;
