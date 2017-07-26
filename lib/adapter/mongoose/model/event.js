"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * イベント(公演など)スキーマ
 */
const schema = new mongoose.Schema({
    typeOf: {
        type: String,
        required: true
    },
    identifier: String,
    name: multilingualString_1.default,
    description: multilingualString_1.default,
    doorTime: Date,
    duration: String,
    endDate: Date,
    eventStatus: String,
    location: mongoose.SchemaTypes.Mixed,
    startDate: Date,
    workPerformed: mongoose.SchemaTypes.Mixed,
    superEvent: mongoose.SchemaTypes.Mixed,
    videoFormat: String,
    kanaName: String,
    alternativeHeadline: String,
    coaInfo: mongoose.SchemaTypes.Mixed
}, {
    collection: 'events',
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
exports.default = mongoose.model('Event', schema);
