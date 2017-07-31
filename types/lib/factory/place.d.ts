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
    openingHoursSpecification?: any;
    smokingAllowed?: boolean;
    telephone?: string;
    url?: string;
    /**
     * スキーマタイプ
     */
    typeOf: PlaceType;
}
export declare function create(args: {
    id?: string;
    name?: IMultilingualString;
    description?: IMultilingualString;
    address?: IMultilingualString;
    branchCode?: string;
    containedInPlace?: IPlace;
    containsPlace?: IPlace[];
    maximumAttendeeCapacity?: number;
    openingHoursSpecification?: any;
    smokingAllowed?: boolean;
    telephone?: string;
    url?: URL;
    typeOf: PlaceType;
}): IPlace;
