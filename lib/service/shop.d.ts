/**
 * ショップサービス
 *
 * @namespace service/shop
 */
import * as factory from '@motionpicture/sskts-factory';
import OrganizationRepository from '../repository/organization';
export declare function open(organization: factory.organization.movieTheater.IOrganization): (organizationRepository: OrganizationRepository) => Promise<void>;
