"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * パフォーマンス
 *
 * @class Performance
 *
 * @param {string} id
 * @param {Theater} theater 劇場
 * @param {Screen} screen スクリーン
 * @param {Film} film 作品
 * @param {string} day 上映日(※日付は西暦8桁 "YYYYMMDD")
 * @param {string} time_start 上映開始時刻
 * @param {string} time_end 上映終了時刻
 * @param {boolean} canceled 上映中止フラグ
 */
class Performance {
    constructor(id, theater, screen, film, day, time_start, time_end, canceled
        // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
        // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
        // kbn_acoustic: String, // 音響区分
        // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    ) {
        this.id = id;
        this.theater = theater;
        this.screen = screen;
        this.film = film;
        this.day = day;
        this.time_start = time_start;
        this.time_end = time_end;
        this.canceled = canceled;
        // todo validation
    }
    toDocument() {
        return {
            id: this.id,
            theater: this.theater.id,
            screen: this.screen.id,
            film: this.film.id,
            day: this.day,
            time_start: this.time_start,
            time_end: this.time_end,
            canceled: this.canceled
            // trailer_time: this.id,
            // kbn_service: this.id,
            // kbn_acoustic: this.id,
            // name_service_day: this.id,
        };
    }
}
(function (Performance) {
    function create(args) {
        return new Performance(args.id, args.theater, args.screen, args.film, args.day, args.time_start, args.time_end, args.canceled);
    }
    Performance.create = create;
    function createFromCOA(performanceFromCOA) {
        return (screen, film) => {
            const id = [
                screen.theater.id,
                performanceFromCOA.date_jouei,
                performanceFromCOA.title_code,
                performanceFromCOA.title_branch_num,
                performanceFromCOA.screen_code,
                performanceFromCOA.time_begin
            ].join('');
            return create({
                id: id,
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
exports.default = Performance;
