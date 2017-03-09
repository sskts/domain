"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const owner_1 = require("./owner");
/**
 * 取引スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    expired_at: Date,
    status: String,
    owners: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: owner_1.default.modelName
        }],
    inquiry_key: {
        theater_code: String,
        reserve_num: Number,
        tel: String // 照会PASS
    },
    queues_status: String
}, {
    collection: 'transactions',
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
exports.default = mongoose.model('Transaction', schema);
