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
(function (Performance) {
    function create(args) {
        return new Performance(args._id, args.theater, args.screen, args.film, args.day, args.time_start, args.time_end, args.canceled);
    }
    Performance.create = create;
    function createFromCOA(performanceFromCOA) {
        return (screen, film) => {
            const id = [
                screen.theater._id,
                performanceFromCOA.date_jouei,
                performanceFromCOA.title_code,
                performanceFromCOA.title_branch_num,
                performanceFromCOA.screen_code,
                performanceFromCOA.time_begin
            ].join('');
            return create({
                _id: id,
                theater: screen.theater,
                screen: screen,
                film: film,
                day: performanceFromCOA.date_jouei,
                time_start: performanceFromCOA.time_begin,
                time_end: performanceFromCOA.time_end,
                canceled: false
            });
        };
    }
    Performance.createFromCOA = createFromCOA;
})(Performance || (Performance = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Performance;
