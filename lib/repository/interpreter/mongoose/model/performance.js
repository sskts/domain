"use strict";
const mongoose = require("mongoose");
const film_1 = require("./film");
const screen_1 = require("./screen");
const theater_1 = require("./theater");
/**
 * パフォーマンススキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    theater: {
        type: String,
        ref: theater_1.default.modelName,
    },
    theater_name: {
        ja: String,
        en: String,
    },
    screen: {
        type: String,
        ref: screen_1.default.modelName,
    },
    screen_name: {
        ja: String,
        en: String,
    },
    film: {
        type: String,
        ref: film_1.default.modelName,
    },
    film_name: {
        ja: String,
        en: String,
    },
    day: String,
    // time_open: String, // 開演時刻
    time_start: String,
    time_end: String,
    // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
    // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
    // kbn_acoustic: String, // 音響区分
    // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など　※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
    canceled: Boolean,
}, {
    collection: "performances",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
/**
 * 空席ステータスを算出する
 *
 * @param {string} reservationNumber 予約数
 */
/*
schema.methods.getSeatStatus = function(reservationNumber: number) {
    // 上映日当日過ぎていればG
    if (parseInt(this.day) < parseInt(moment().format("YYYYMMDD"))) return PerformanceUtil.SEAT_STATUS_G;

    // 残席0以下なら問答無用に×
    let availableSeatNum = this.screen.seats_number - reservationNumber;
    if (availableSeatNum <= 0) return PerformanceUtil.SEAT_STATUS_C;

    // 残席数よりステータスを算出
    let seatNum = 100 * availableSeatNum;
    if (PerformanceUtil.SEAT_STATUS_THRESHOLD_A * this.screen.seats_number < seatNum) return PerformanceUtil.SEAT_STATUS_A;
    if (PerformanceUtil.SEAT_STATUS_THRESHOLD_B * this.screen.seats_number < seatNum) return PerformanceUtil.SEAT_STATUS_B;

    return PerformanceUtil.SEAT_STATUS_C;
};
*/
schema.index({
    day: 1,
    time_start: 1,
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model("Performance", schema);
