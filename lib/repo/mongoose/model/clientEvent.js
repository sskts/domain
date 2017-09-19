"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const transaction_1 = require("./transaction");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * アプリケーションクライアントイベントスキーマ
 * @ignore
 */
const schema = new mongoose.Schema({
    client: String,
    occurredAt: Date,
    url: String,
    label: String,
    category: String,
    action: String,
    message: String,
    notes: String,
    useragent: String,
    location: [Number, Number],
    transaction: {
        type: String,
        ref: transaction_1.default.modelName
    }
}, {
    collection: 'clientEvents',
    id: true,
    read: 'primaryPreferred',
    safe: safe,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
exports.default = mongoose.model('ClientEvent', schema);
