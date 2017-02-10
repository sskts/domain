/**
 * 作品ファクトリー
 *
 * @namespace FilmFactory
 */
import Film from "../model/film";
import MultilingualString from "../model/multilingualString";
import Theater from "../model/theater";
import COA = require("@motionpicture/coa-service");
export declare function create(args: {
    _id: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    theater: Theater;
    name: MultilingualString;
    name_kana: string;
    name_short: string;
    name_original: string;
    minutes: number;
    date_start: string;
    date_end: string;
    kbn_eirin?: string;
    kbn_eizou?: string;
    kbn_joueihousiki?: string;
    kbn_jimakufukikae?: string;
}): Film;
export declare function createFromCOA(filmFromCOA: COA.findFilmsByTheaterCodeInterface.Result): (theater: Theater) => Promise<Film>;
