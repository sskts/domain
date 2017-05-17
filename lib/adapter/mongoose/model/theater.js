"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 劇場スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    name: {
        ja: String,
        en: String
    },
    name_kana: String,
    address: {
        ja: String,
        en: String
    },
    gmo_site_id: String,
    gmo_shop_id: String,
    gmo_shop_pass: String // 劇場ごとにGMOショップが異なる可能性があるため
}, {
    collection: 'theaters',
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
exports.default = mongoose.model('Theater', schema);
