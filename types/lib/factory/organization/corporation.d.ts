/**
 * 企業ファクトリー
 *
 * @namespace factory/organization/corporation
 */
import IMultilingualString from '../multilingualString';
import * as OrganizationFactory from '../organization';
import CorporationOrganizationIdentifier from '../organizationIdentifier/corporation';
export interface IOrganization extends OrganizationFactory.IOrganization {
    identifier: CorporationOrganizationIdentifier;
}
export declare function create(args: {
    identifier: CorporationOrganizationIdentifier;
    name: IMultilingualString;
    legalName?: IMultilingualString;
}): IOrganization;
