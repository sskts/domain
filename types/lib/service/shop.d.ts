/**
 * ショップサービス
 *
 * @namespace service/shop
 */
import * as MovieTheaterOrganizationFactory from '../factory/organization/movieTheater';
import OrganizationAdapter from '../adapter/organization';
export declare function open(organization: MovieTheaterOrganizationFactory.IOrganization): (organizationAdapter: OrganizationAdapter) => Promise<void>;
