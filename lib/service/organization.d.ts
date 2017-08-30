/**
 * 組織サービス
 *
 * @namespace service/organization
 */
import * as factory from '@motionpicture/sskts-factory';
import OrganizationAdapter from '../adapter/organization';
export declare type IOrganizationOperation<T> = (organizationAdapter: OrganizationAdapter) => Promise<T>;
/**
 * 劇場検索
 */
export declare function searchMovieTheaters(searchConditions: {}): IOrganizationOperation<factory.organization.movieTheater.IPublicFields[]>;
/**
 * 枝番号で劇場検索
 */
export declare function findMovieTheaterByBranchCode(branchCode: string): IOrganizationOperation<factory.organization.movieTheater.IPublicFields>;
