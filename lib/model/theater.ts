import MultilingualString from './multilingualString';

/**
 * 劇場
 *
 * @class Theater
 *
 * @param {string} _id
 * @param {MultilingualString} name 劇場名称
 * @param {string} name_kana 劇場名称(カナ)
 * @param {MultilingualString} address 劇場住所
 */
export default class Theater {
    constructor(
        readonly _id: string,
        readonly name: MultilingualString,
        readonly name_kana: string,
        readonly address: MultilingualString
    ) {
        // todo validation
    }
}
