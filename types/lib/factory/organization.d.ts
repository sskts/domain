/**
 * 組織ファクトリー
 *
 * @namespace factory/organization
 */
import IMultilingualString from './multilingualString';
import OrganizationType from './organizationType';
import * as URLFactory from './url';
export interface IOrganization {
    id: string;
    identifier: string;
    name: IMultilingualString;
    legalName: IMultilingualString;
    typeOf: OrganizationType;
    location?: any;
    sameAs?: URLFactory.IURL;
}
export declare function create(args: {
    id?: string;
    identifier: string;
    name: IMultilingualString;
    legalName?: IMultilingualString;
    typeOf: OrganizationType;
    location?: any;
    sameAs?: URLFactory.IURL;
}): IOrganization;
