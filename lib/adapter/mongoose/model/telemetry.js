"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 測定スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    flow: {
        transactions: {
            numberOfStarted: Number,
            numberOfClosed: Number,
            numberOfExpired: Number
        },
        queues: {
            numberOfCreated: Number
        },
        measured_from: Date,
        measured_to: Date
    },
    stock: {
        transactions: {
            numberOfUnderway: Number
        },
        queues: {
            numberOfUnexecuted: Number
        },
        measured_at: Date
    }
}, {
    collection: 'telemetries',
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
exports.default = mongoose.model('Telemetry', schema);
