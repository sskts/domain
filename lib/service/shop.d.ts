/**
 * ショップサービス
 *
 * @namespace service/shop
 */
import * as factory from '@motionpicture/sskts-factory';
import OrganizationAdapter from '../adapter/organization';
export declare function open(organization: factory.organization.movieTheater.IOrganization): (organizationAdapter: OrganizationAdapter) => Promise<void>;
