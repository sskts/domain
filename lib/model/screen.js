"use strict";
/**
 * スクリーン
 *
 * @export
 * @class Screen
 */
class Screen {
    /**
     * Creates an instance of Screen.
     *
     * @param {string} _id
     * @param {Theater} theater 劇場
     * @param {string} coa_screen_code COAスクリーンコード
     * @param {MultilingualString} name スクリーン名称
     * @param {Array<Section>} sections スクリーンセクションリスト
     *
     * @memberOf Screen
     */
    constructor(_id, theater, coa_screen_code, name, sections) {
        this._id = _id;
        this.theater = theater;
        this.coa_screen_code = coa_screen_code;
        this.name = name;
        this.sections = sections;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;
