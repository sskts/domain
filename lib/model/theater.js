"use strict";
/**
 * 劇場
 *
 * @export
 * @class Theater
 */
class Theater {
    /**
     * Creates an instance of Theater.
     *
     * @param {string} _id
     * @param {MultilingualString} name 劇場名称
     * @param {string} name_kana 劇場名称(カナ)
     * @param {MultilingualString} address 劇場住所
     *
     * @memberOf Theater
     */
    constructor(_id, name, name_kana, address) {
        this._id = _id;
        this.name = name;
        this.name_kana = name_kana;
        this.address = address;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Theater;
