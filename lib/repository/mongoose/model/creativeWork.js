"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 作品スキーマ
 */
const schema = new mongoose.Schema({
    typeOf: {
        type: String,
        required: true
    },
    identifier: String,
    name: String,
    description: String,
    copyrightHolder: mongoose.SchemaTypes.Mixed,
    copyrightYear: Number,
    datePublished: Date,
    license: String,
    thumbnailUrl: String,
    duration: String,
    contentRating: String,
    coaInfo: mongoose.SchemaTypes.Mixed
}, {
    collection: 'creativeWorks',
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
exports.default = mongoose.model('CreativeWork', schema);
