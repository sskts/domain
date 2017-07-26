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
        identifier: filmFromCOA.titleCode,
        name: filmFromCOA.titleNameOrig,
        duration: moment.duration(filmFromCOA.showTime, 'm').toISOString(),
        contentRating: filmFromCOA.kbnEirin,
        typeOf: creativeWorkType_1.default.Movie
    };
}
exports.createFromCOA = createFromCOA;
