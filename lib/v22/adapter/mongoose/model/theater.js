"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 劇場スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    name: multilingualString_1.default,
    name_kana: String,
    address: multilingualString_1.default,
    gmo: {
        _id: false,
        site_id: String,
        shop_id: String,
        shop_pass: String
    },
    websites: [{
            _id: false,
            group: String,
            name: multilingualString_1.default,
            url: String
        }]
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
