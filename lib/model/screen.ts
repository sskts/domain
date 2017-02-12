import MultilingualString from "./multilingualString";
import Theater from "./theater";

/**
 * スクリーン座席
 *
 *
 * @interface Seat
 */
export interface Seat {
    /**
     * 座席コード
     *
     * @type {string}
     * @memberOf Seat
     */
    code: string;
}
/**
 * スクリーンセクション
 *
 *
 * @interface Section
 */
export interface Section {
    /**
     * セクションコード
     *
     * @type {string}
     * @memberOf Section
     */
    code: string;
    /**
     * セクション名称
     *
     * @type {MultilingualString}
     * @memberOf Section
     */
    name: MultilingualString;
    /**
     * 座席リスト
     *
     * @type {Array<Seat>}
     * @memberOf Section
     */
    seats: Array<Seat>;
}

/**
 * スクリーン
 *
 * @class Screen
 *
 * @param {string} _id
 * @param {Theater} theater 劇場
 * @param {string} coa_screen_code COAスクリーンコード
 * @param {MultilingualString} name スクリーン名称
 * @param {Array<Section>} sections スクリーンセクションリスト
 */
export default class Screen {
    constructor(
        readonly _id: string,
        readonly theater: Theater,
        readonly coa_screen_code: string,
        readonly name: MultilingualString,
        readonly sections: Array<Section>
    ) {
        // TODO validation
    }
}