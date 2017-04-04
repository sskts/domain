"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const theater_1 = require("./theater");
/**
 * 作品スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    theater: {
        type: String,
        ref: theater_1.default.modelName
    },
    name: {
        ja: String,
        en: String
    },
    name_kana: String,
    name_short: String,
    name_original: String,
    minutes: Number,
    date_start: String,
    date_end: String,
    kbn_eirin: String,
    kbn_eizou: String,
    kbn_joueihousiki: String,
    kbn_jimakufukikae: String,
    copyright: String,
    coa_title_code: String,
    coa_title_branch_num: String,
    flg_mvtk_use: String,
    date_mvtk_begin: String // ムビチケ利用開始日
}, {
    collection: 'films',
    id: true,
    read: 'primaryPreferred',
    safe: { j: 1, w: 'majority', wtimeout: 10000 },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
exports.default = mongoose.model('Film', schema);
