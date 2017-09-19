"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * SendGridイベントスキーマ
 * @ignore
 */
const schema = new mongoose.Schema({
    notification: String,
    status: String,
    // recommend that you use some form of deduplication
    // when processing or storing your Event Webhook data using the sg_event_id as a differentiator,
    // since this ID is unique for every event.
    sg_event_id: String,
    sg_message_id: String,
    event: String,
    email: String,
    timestamp: Number,
    'smtp-id': String,
    category: [String],
    asm_group_id: Number,
    reason: String,
    type: String,
    ip: String,
    tls: String,
    cert_err: String,
    useragent: String,
    url: String,
    url_offset: {
        type: {
            _id: false,
            index: Number,
            type: String
        }
    },
    response: String,
    send_at: Number
}, {
    collection: 'sendgrid_events',
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
exports.default = mongoose.model('SendGridEvent', schema);
