"use strict";
/**
 * パフォーマンス
 *
 * @class Performance
 *
 * @param {string} _id
 * @param {Theater} theater 劇場
 * @param {Screen} screen スクリーン
 * @param {Film} film 作品
 * @param {string} day 上映日(※日付は西暦8桁 "YYYYMMDD")
 * @param {string} time_start 上映開始時刻
 * @param {string} time_end 上映終了時刻
 * @param {boolean} canceled 上映中止フラグ
 */
class Performance {
    constructor(_id, theater, screen, film, day, time_start, time_end, canceled) {
        this._id = _id;
        this.theater = theater;
        this.screen = screen;
        this.film = film;
        this.day = day;
        this.time_start = time_start;
        this.time_end = time_end;
        this.canceled = canceled;
        // todo validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Performance;
