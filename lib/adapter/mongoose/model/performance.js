"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const film_1 = require("./film");
const screen_1 = require("./screen");
const theater_1 = require("./theater");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * パフォーマンススキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    theater: {
        type: String,
        ref: theater_1.default.modelName
    },
    theater_name: multilingualString_1.default,
    screen: {
        type: String,
        ref: screen_1.default.modelName
    },
    screen_name: multilingualString_1.default,
    film: {
        type: String,
        ref: film_1.default.modelName
    },
    film_name: multilingualString_1.default,
    day: String,
    // time_open: String, // 開演時刻
    time_start: String,
    time_end: String,
    canceled: Boolean,
    coa_trailer_time: Number,
    coa_kbn_service: String,
    coa_kbn_acoustic: String,
    coa_name_service_day: String,
    coa_available_num: Number,
    coa_rsv_start_date: String,
    coa_rsv_end_date: String,
    coa_flg_early_booking: String // 先行予約フラグ
}, {
    collection: 'performances',
    id: true,
    read: 'primaryPreferred',
    safe: safe,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
// パフォーマンス検索時に使用
schema.index({ theater: 1, day: 1, time_start: 1 });
exports.default = mongoose.model('Performance', schema);
