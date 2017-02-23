"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 作品
 *
 * @class Film
 *
 * @param {string} id
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
    constructor(id, coa_title_code, coa_title_branch_num, theater, name, name_kana, name_short, name_original, minutes, date_start, date_end, kbn_eirin, kbn_eizou, kbn_joueihousiki, kbn_jimakufukikae) {
        this.id = id;
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
    toDocument() {
        return {
            id: this.id,
            coa_title_code: this.coa_title_code,
            coa_title_branch_num: this.coa_title_branch_num,
            theater: this.theater.id,
            name: this.name,
            name_kana: this.name_kana,
            name_short: this.name_short,
            name_original: this.name_original,
            minutes: this.minutes,
            date_start: this.date_start,
            date_end: this.date_end,
            kbn_eirin: this.kbn_eirin,
            kbn_eizou: this.kbn_eizou,
            kbn_joueihousiki: this.kbn_joueihousiki,
            kbn_jimakufukikae: this.kbn_jimakufukikae
        };
    }
}
(function (Film) {
    function create(args) {
        return new Film(args.id, args.coa_title_code, args.coa_title_branch_num, args.theater, args.name, args.name_kana, // 作品タイトル名（カナ）
        args.name_short, // 作品タイトル名省略
        args.name_original, // 原題
        args.minutes, // 上映時間
        args.date_start, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        args.date_end, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        (args.kbn_eirin === undefined) ? '' : args.kbn_eirin, (args.kbn_eizou === undefined) ? '' : args.kbn_eizou, (args.kbn_joueihousiki === undefined) ? '' : args.kbn_joueihousiki, (args.kbn_jimakufukikae === undefined) ? '' : args.kbn_jimakufukikae);
    }
    Film.create = create;
    function createFromCOA(filmFromCOA) {
        return (theater) => __awaiter(this, void 0, void 0, function* () {
            return create({
                // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
                id: `${theater.id}${filmFromCOA.title_code}${filmFromCOA.title_branch_num}`,
                coa_title_code: filmFromCOA.title_code,
                coa_title_branch_num: filmFromCOA.title_branch_num,
                theater: theater,
                name: {
                    ja: filmFromCOA.title_name,
                    en: filmFromCOA.title_name_eng
                },
                name_kana: filmFromCOA.title_name_kana,
                name_short: filmFromCOA.title_name_short,
                name_original: filmFromCOA.title_name_orig,
                minutes: filmFromCOA.show_time,
                date_start: filmFromCOA.date_begin,
                date_end: filmFromCOA.date_end,
                kbn_eirin: filmFromCOA.kbn_eirin,
                kbn_eizou: filmFromCOA.kbn_eizou,
                kbn_joueihousiki: filmFromCOA.kbn_joueihousiki,
                kbn_jimakufukikae: filmFromCOA.kbn_jimakufukikae
            });
        });
    }
    Film.createFromCOA = createFromCOA;
})(Film || (Film = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Film;
