"use strict";
/**
 * 作品
 *
 * @class Film
 *
 * @param {string} _id
 * @param {string} coa_title_code COA作品コード
 * @param {string} coa_title_branch_num COA作品枝番
 * @param {Theater} theater 劇場
 * @param {MultilingualString} name 名称
 * @param {string} name_kana 作品タイトル名（カナ）
 * @param {string} name_short 作品タイトル名省略
 * @param {string} name_original 原題
 * @param {number} minutes 上映時間
 * @param {string} date_start 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
 * @param {string} date_end 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
 * @param {string} kbn_eirin 映倫区分
 * @param {string} kbn_eizou 映像区分
 * @param {string} kbn_joueihousiki 上映方式区分
 * @param {string} kbn_jimakufukikae 字幕吹替区分
 */
class Film {
    constructor(_id, coa_title_code, coa_title_branch_num, theater, name, name_kana, name_short, name_original, minutes, date_start, date_end, kbn_eirin, kbn_eizou, kbn_joueihousiki, kbn_jimakufukikae) {
        this._id = _id;
        this.coa_title_code = coa_title_code;
        this.coa_title_branch_num = coa_title_branch_num;
        this.theater = theater;
        this.name = name;
        this.name_kana = name_kana;
        this.name_short = name_short;
        this.name_original = name_original;
        this.minutes = minutes;
        this.date_start = date_start;
        this.date_end = date_end;
        this.kbn_eirin = kbn_eirin;
        this.kbn_eizou = kbn_eizou;
        this.kbn_joueihousiki = kbn_joueihousiki;
        this.kbn_jimakufukikae = kbn_jimakufukikae;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Film;
