/**
 * 劇場組織ファクトリー
 *
 * @namespace factory/organization/movieTheater
 */

import IMultilingualString from '../multilingualString';
import * as OrganizationFactory from '../organization';
import OrganizationType from '../organizationType';
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
    branchCode: string; // 劇場コード
    gmoInfo: IGMOInfo;
    parentOrganization: IParentOrganization;
    location: ILocation;
    sameAs: URLFactory.IURL;
}

export function create(args: {
    name: IMultilingualString;
    branchCode: string; // 劇場コード
    gmoInfo: IGMOInfo;
    parentOrganization: IParentOrganization;
    location: ILocation;
    sameAs: URLFactory.IURL;
}): IOrganization {
    const identifier = `MovieTheaterOrganization-${args.branchCode}`;

    return {
        ...OrganizationFactory.create({
            identifier: identifier,
            name: args.name,
            typeOf: OrganizationType.MovieTheater
        }),
        ...{
            branchCode: args.branchCode,
            gmoInfo: args.gmoInfo,
            parentOrganization: args.parentOrganization,
            location: args.location,
            sameAs: args.sameAs
        }
    };
}
