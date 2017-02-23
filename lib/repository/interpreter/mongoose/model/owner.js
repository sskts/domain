"use strict";
const mongoose = require("mongoose");
/**
 * 所有者スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    group: String,
    name_first: String,
    name_last: String,
    email: String,
    tel: String,
    name: {
        ja: String,
        en: String
    }
}, {
    collection: 'owners',
    id: true,
    read: 'primaryPreferred',
    safe: { j: 1, w: 'majority', wtimeout: 5000 },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('Owner', schema);
