"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 *
 * @export
 * @param {COA.MasterService.TitleResult} filmFromCOA
 */
function createFromCOA(filmFromCOA) {
    return (theater) => {
        return {
            // title_codeは劇場をまたいで共有、title_branch_numは劇場毎に管理
            id: `${theater.id}${filmFromCOA.title_code}${filmFromCOA.title_branch_num}`,
            coa_title_code: filmFromCOA.title_code,
            coa_title_branch_num: filmFromCOA.title_branch_num,
            theater: theater.id,
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
        };
    };
}
exports.createFromCOA = createFromCOA;
