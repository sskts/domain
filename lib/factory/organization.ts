/**
 * 組織ファクトリー
 *
 * @namespace factory/organization
 */

import IMultilingualString from './multilingualString';
import OrganizationType from './organizationType';
import * as URLFactory from './url';

/**
 * 組織インターフェース
 */
export interface IOrganization {
    id: string;
    identifier: string;
    name: IMultilingualString;
    legalName: IMultilingualString;
    typeOf: OrganizationType;
    location?: any;
    telephone?: string;
    url?: URLFactory.IURL;
}

export function create(args: {
    id?: string;
    identifier: string;
    name: IMultilingualString;
    legalName?: IMultilingualString;
    typeOf: OrganizationType;
    location?: any;
    telephone?: string;
    url?: URLFactory.IURL;
}): IOrganization {
    return {
        id: (args.id === undefined) ? '' : args.id,
        identifier: args.identifier,
        name: args.name,
        legalName: (args.legalName === undefined) ? { ja: '', en: '' } : args.legalName,
        typeOf: args.typeOf,
        location: args.location,
        telephone: args.telephone,
        url: (args.url !== undefined) ? args.url.toString() : undefined
    };
}
