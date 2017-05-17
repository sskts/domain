import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * SendGridイベントスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        notification: String, // ssktsの通知ID
        status: String,
        // recommend that you use some form of deduplication
        // when processing or storing your Event Webhook data using the sg_event_id as a differentiator,
        // since this ID is unique for every event.
        sg_event_id: String,
        sg_message_id: String,
        event: String, // One of: bounce, deferred, delivered, dropped, processed
        email: String, // Email address of the intended recipient
        timestamp: Number, // UNIX timestamp
        'smtp-id': String, // An id attached to the message by the originating system
        category: [String],
        asm_group_id: Number,
        reason: String,
        type: String,
        ip: String, // Which IP address was used to send the email.
        tls: String, // Whether or not TLS was used when sending the email.
        cert_err: String, // Whether there was a certificate error on the receiving side.
        useragent: String, // The user agent responsible for the event
        url: String,
        url_offset: {
            index: Number,
            type: String
        },
        response: String,
        send_at: Number
    },
    {
        collection: 'sendgrid_events',
        id: true,
        read: 'primaryPreferred',
        safe: safe,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('SendGridEvent', schema);
