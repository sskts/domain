"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
/**
 * 測定スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    transactions: {
        numberOfReady: Number,
        numberOfUnderway: Number,
        numberOfClosedWithQueuesUnexported: Number,
        numberOfExpiredWithQueuesUnexported: Number
    },
    queues: {
        numberOfUnexecuted: Number
    },
    executed_at: Date
}, {
    collection: 'telemetries',
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
exports.default = mongoose.model('Telemetry', schema);
