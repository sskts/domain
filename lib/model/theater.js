"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    constructor(id, name, name_kana, address) {
        this.id = id;
        this.name = name;
        this.name_kana = name_kana;
        this.address = address;
        // todo validation
    }
}
/**
 * 劇場
 *
 * @namespace model/theater
 */
(function (Theater) {
    function create(args) {
        return new Theater(args.id, args.name, args.name_kana, args.address);
    }
    Theater.create = create;
    function createFromCOA(theaterFromCOA) {
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
    Theater.createFromCOA = createFromCOA;
})(Theater || (Theater = {}));
exports.default = Theater;
