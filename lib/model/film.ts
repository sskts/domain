// tslint:disable:variable-name
import * as COA from '@motionpicture/coa-service';
import MultilingualString from './multilingualString';
import Theater from './theater';

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
    constructor(
        readonly _id: string,
        readonly coa_title_code: string,
        readonly coa_title_branch_num: string,
        readonly theater: Theater,
        readonly name: MultilingualString,
        readonly name_kana: string,
        readonly name_short: string,
        readonly name_original: string,
        readonly minutes: number,
        readonly date_start: string,
        readonly date_end: string,
        readonly kbn_eirin: string,
        readonly kbn_eizou: string,
        readonly kbn_joueihousiki: string,
        readonly kbn_jimakufukikae: string
    ) {
        // todo validation
    }
}

namespace Film {
    export interface IFilm {
        _id: string;
        coa_title_code: string;
        coa_title_branch_num: string;
        theater: Theater;
        name: MultilingualString;
        name_kana: string; // 作品タイトル名（カナ）
        name_short: string; // 作品タイトル名省略
        name_original: string; // 原題
        minutes: number; // 上映時間
        date_start: string; // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
        date_end: string; // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
        kbn_eirin?: string;
        kbn_eizou?: string;
        kbn_joueihousiki?: string;
        kbn_jimakufukikae?: string;
    }

    export function create(args: IFilm) {
        return new Film(
            args._id,
            args.coa_title_code,
            args.coa_title_branch_num,
            args.theater,
            args.name,
            args.name_kana, // 作品タイトル名（カナ）
            args.name_short, // 作品タイトル名省略
            args.name_original, // 原題
            args.minutes, // 上映時間
            args.date_start, // 公演開始予定日※日付は西暦8桁 "YYYYMMDD"
            args.date_end, // 公演終了予定日※日付は西暦8桁 "YYYYMMDD"
            (args.kbn_eirin === undefined) ? '' : args.kbn_eirin,
            (args.kbn_eizou === undefined) ? '' : args.kbn_eizou,
            (args.kbn_joueihousiki === undefined) ? '' : args.kbn_joueihousiki,
            (args.kbn_jimakufukikae === undefined) ? '' : args.kbn_jimakufukikae
        );
    }

    export function createFromCOA(filmFromCOA: COA.findFilmsByTheaterCodeInterface.Result) {
        return async (theater: Theater) => create({
            // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
            _id: `${theater._id}${filmFromCOA.title_code}${filmFromCOA.title_branch_num}`,
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
    }
}

export default Film;
