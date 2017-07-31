/**
 * 企業ファクトリー
 *
 * @namespace factory/organization/corporation
 */
import IMultilingualString from '../multilingualString';
import * as OrganizationFactory from '../organization';
import CorporationOrganizationIdentifier from '../organizationIdentifier/corporation';
/**
 * 企業組織インターフェース
 */
export interface IOrganization extends OrganizationFactory.IOrganization {
    /**
     * 組織識別子
     */
    identifier: CorporationOrganizationIdentifier;
}
export declare function create(args: {
    identifier: CorporationOrganizationIdentifier;
    name: IMultilingualString;
    legalName?: IMultilingualString;
}): IOrganization;
