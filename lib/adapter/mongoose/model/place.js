"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 場所スキーマ
 */
const schema = new mongoose.Schema({
    typeOf: String,
    name: multilingualString_1.default,
    description: multilingualString_1.default,
    address: multilingualString_1.default,
    branchCode: String,
    containedInPlace: mongoose.SchemaTypes.Mixed,
    containsPlace: mongoose.SchemaTypes.Mixed,
    maximumAttendeeCapacity: Number,
    openingHoursSpecification: mongoose.SchemaTypes.Mixed,
    smokingAllowed: Boolean,
    telephone: String,
    sameAs: String,
    kanaName: String,
    coaInfo: mongoose.SchemaTypes.Mixed
}, {
    collection: 'places',
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
exports.default = mongoose.model('Place', schema);
