/**
 * 場所ファクトリー
 *
 * @namespace factory/place
 */

import IMultilingualString from './multilingualString';
import PlaceType from './placeType';

/**
 * 場所インターフェース
 */
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
    url?: string;
    /**
     * スキーマタイプ
     */
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
    url?: URL;
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
        url: (args.url !== undefined) ? args.url.toString() : undefined,
        typeOf: args.typeOf
    };
}
