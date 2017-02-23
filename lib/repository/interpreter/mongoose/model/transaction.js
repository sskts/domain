"use strict";
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
    safe: { j: 1, w: 'majority', wtimeout: 5000 },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('Transaction', schema);
