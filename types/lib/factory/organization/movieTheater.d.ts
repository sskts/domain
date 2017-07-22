/**
 * 劇場組織ファクトリー
 *
 * @namespace factory/organization/movieTheater
 */
import IMultilingualString from '../multilingualString';
import * as OrganizationFactory from '../organization';
import * as URLFactory from '../url';
export interface IGMOInfo {
    siteID: string;
    shopID: string;
    shopPass: string;
}
export interface ILocation {
    typeOf: string;
    branchCode: string;
    name: IMultilingualString;
}
export interface IParentOrganization {
    typeOf: string;
    identifier: string;
    name: IMultilingualString;
}
export interface IOrganization extends OrganizationFactory.IOrganization {
    identifier: string;
    name: IMultilingualString;
    branchCode: string;
    gmoInfo: IGMOInfo;
    parentOrganization: IParentOrganization;
    location: ILocation;
    sameAs: URLFactory.IURL;
}
export declare function create(args: {
    name: IMultilingualString;
    branchCode: string;
    gmoInfo: IGMOInfo;
    parentOrganization: IParentOrganization;
    location: ILocation;
    sameAs: URLFactory.IURL;
}): IOrganization;
