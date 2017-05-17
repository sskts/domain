"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const theater_1 = require("./theater");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 券種スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    theater: {
        type: String,
        ref: theater_1.default.modelName,
        required: true
    },
    code: String,
    name: {
        type: {
            ja: String,
            en: String
        }
    },
    name_kana: String // チケット名(カナ)
}, {
    collection: 'tickets',
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
exports.default = mongoose.model('Ticket', schema);
