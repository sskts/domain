// tslint:disable:variable-name
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';

/**
 * 劇場
 *
 * @class Theater
 *
 * @param {string} id
 * @param {MultilingualString} name 劇場名称
 * @param {string} name_kana 劇場名称(カナ)
 * @param {MultilingualString} address 劇場住所
 */
class Theater {
    constructor(
        readonly id: string,
        readonly name: MultilingualString,
        readonly name_kana: string,
        readonly address: MultilingualString
    ) {
        // todo validation
    }
}

/**
 * 劇場
 *
 * @namespace model/theater
 */
namespace Theater {
    export interface ITheater {
        id: string;
        name: MultilingualString;
        name_kana: string;
        address: MultilingualString;
    }

    export function create(args: ITheater) {
        return new Theater(
            args.id,
            args.name,
            args.name_kana,
            args.address
        );
    }

    export function createFromCOA(theaterFromCOA: COA.MasterService.TheaterResult) {
        return create({
            id: theaterFromCOA.theater_code,
            name: {
                ja: theaterFromCOA.theater_name,
                en: theaterFromCOA.theater_name_eng
            },
            name_kana: theaterFromCOA.theater_name_kana,
            address: {
                ja: '',
                en: ''
            }
        });
    }
}

export default Theater;
