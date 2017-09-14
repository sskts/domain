"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 人物スキーマ
 * @ignore
 */
const schema = new mongoose.Schema({
    typeOf: {
        type: String,
        required: true
    },
    owns: [mongoose.SchemaTypes.Mixed]
}, {
    collection: 'people',
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
exports.default = mongoose.model('People', schema);
