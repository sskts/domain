/**
 * 場所ファクトリー
 *
 * @namespace factory/place
 */

import IMultilingualString from './multilingualString';
import PlaceType from './placeType';

export interface IPlace {
    id?: string;
    name?: IMultilingualString;
    description?: IMultilingualString;
    address?: IMultilingualString;
    branchCode?: string;
    containedInPlace?: IPlace;
    containsPlace?: IPlace[];
    maximumAttendeeCapacity?: number;
    openingHoursSpecification?: any; // todo 型定義
    smokingAllowed?: boolean;
    telephone?: string;
    sameAs?: string;
    typeOf: PlaceType;
}

export function create(args: {
    id?: string;
    name?: IMultilingualString;
    description?: IMultilingualString;
    address?: IMultilingualString;
    branchCode?: string;
    containedInPlace?: IPlace;
    containsPlace?: IPlace[];
    maximumAttendeeCapacity?: number;
    openingHoursSpecification?: any; // todo 型定義
    smokingAllowed?: boolean;
    telephone?: string;
    sameAs?: URL;
    typeOf: PlaceType;
}): IPlace {
    return {
        id: args.id,
        name: args.name,
        description: args.description,
        address: args.address,
        branchCode: args.branchCode,
        containedInPlace: args.containedInPlace,
        containsPlace: args.containsPlace,
        maximumAttendeeCapacity: args.maximumAttendeeCapacity,
        openingHoursSpecification: args.openingHoursSpecification,
        smokingAllowed: args.smokingAllowed,
        telephone: args.telephone,
        sameAs: (args.sameAs !== undefined) ? args.sameAs.toString() : undefined,
        typeOf: args.typeOf
    };
}
