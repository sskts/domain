"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
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
    name: multilingualString_1.default,
    description: multilingualString_1.default,
    notes: multilingualString_1.default,
    username: String,
    password_hash: String,
    state: String
}, {
    collection: 'owners',
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
// 所有者を特定する時に使用
schema.index({ group: 1 });
// 会員のユーザーネームはユニークに
schema.index({ group: 1, username: 1 }, { unique: true });
exports.default = mongoose.model('Owner', schema);
