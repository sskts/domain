"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 所有権スキーマ
 */
const schema = new mongoose.Schema({
    typeOf: String,
    identifier: String,
    acquiredFrom: mongoose.SchemaTypes.Mixed,
    ownedFrom: Date,
    ownedThrough: Date,
    typeOfGood: mongoose.SchemaTypes.Mixed
}, {
    collection: 'ownershipInfos',
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
exports.default = mongoose.model('OwnershipInfo', schema);
