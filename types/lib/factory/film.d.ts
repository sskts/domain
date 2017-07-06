/**
 * 作品ファクトリー
 *
 * @namespace factory/film
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
import * as COA from '@motionpicture/coa-service';
import IMultilingualString from './multilingualString';
import * as TheaterFactory from './theater';
/**
 *
 * @interface IFilm
 * @memberof tobereplaced$
 */
export interface IFilm {
    id: string;
    coa_title_code: string;
    coa_title_branch_num: string;
    theater: string;
    name: IMultilingualString;
    name_kana: string;
    name_short: string;
    name_original: string;
    minutes: number;
    date_start: string;
    date_end: string;
    kbn_eirin: string;
    kbn_eizou: string;
    kbn_joueihousiki: string;
    kbn_jimakufukikae: string;
    copyright: string;
    /**
     * ムビチケ使用フラグ
     * 1：ムビチケ使用対象
     */
    flg_mvtk_use: string;
    /**
     * ムビチケ利用開始日
     * ※日付は西暦8桁 "YYYYMMDD"
     */
    date_mvtk_begin: string;
}
/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 *
 * @param {COA.services.master.TitleResult} filmFromCOA
 * @memberof tobereplaced$
 */
export declare function createFromCOA(filmFromCOA: COA.services.master.ITitleResult): (theater: TheaterFactory.ITheater) => IFilm;
