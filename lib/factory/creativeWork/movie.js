"use strict";
/**
 * 映画ファクトリー
 *
 * @namespace factory/creativeWork/movie
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const creativeWorkType_1 = require("../creativeWorkType");
/**
 * COAの作品抽出結果からFilmオブジェクトを作成する
 */
function createFromCOA(filmFromCOA) {
    return {
        identifier: filmFromCOA.title_code,
        name: filmFromCOA.title_name_orig,
        duration: moment.duration(filmFromCOA.show_time, 'm').toISOString(),
        contentRating: filmFromCOA.kbn_eirin,
        typeOf: creativeWorkType_1.default.Movie
    };
}
exports.createFromCOA = createFromCOA;
