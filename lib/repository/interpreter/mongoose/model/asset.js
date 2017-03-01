"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const owner_1 = require("./owner");
const performance_1 = require("./performance");
/**
 * 資産スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    ownership: {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: owner_1.default.modelName
        },
        authenticated: Boolean
    },
    authorizations: [mongoose.Schema.Types.Mixed],
    group: String,
    price: Number,
    performance: {
        type: String,
        ref: performance_1.default.modelName
    },
    section: String,
    seat_code: String,
    ticket_code: String,
    ticket_name_ja: String,
    ticket_name_en: String,
    ticket_name_kana: String,
    std_price: Number,
    add_price: Number,
    dis_price: Number,
    sale_price: Number
}, {
    collection: 'assets',
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
exports.default = mongoose.model('Asset', schema);
