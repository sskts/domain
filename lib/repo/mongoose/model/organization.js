"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 組織スキーマ
 * @ignore
 */
const schema = new mongoose.Schema({
    typeOf: {
        type: String,
        required: true
    },
    identifier: String,
    name: multilingualString_1.default,
    legalName: multilingualString_1.default,
    sameAs: String,
    url: String,
    gmoInfo: mongoose.SchemaTypes.Mixed,
    parentOrganization: mongoose.SchemaTypes.Mixed,
    telephone: String,
    location: mongoose.SchemaTypes.Mixed
}, {
    collection: 'organizations',
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
// 組織取得に使用
schema.index({ typeOf: 1, _id: 1 });
exports.default = mongoose.model('Organization', schema);
