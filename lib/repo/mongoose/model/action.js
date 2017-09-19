"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * アクションスキーマ
 * @ignore
 */
const schema = new mongoose.Schema({
    actionStatus: String,
    typeOf: String,
    agent: mongoose.Schema.Types.Mixed,
    recipient: mongoose.Schema.Types.Mixed,
    result: mongoose.Schema.Types.Mixed,
    error: mongoose.Schema.Types.Mixed,
    object: mongoose.Schema.Types.Mixed,
    startDate: Date,
    endDate: Date,
    purpose: mongoose.Schema.Types.Mixed
}, {
    collection: 'actions',
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
// 取引の承認アクション検索に使用
schema.index({ typeOf: 1, 'object.transactionId': 1 });
// 取引の承認アクション状態変更に使用
schema.index({ 'purpose.typeOf': 1, 'object.transactionId': 1, typeOf: 1, _id: 1 });
exports.default = mongoose.model('Action', schema);
