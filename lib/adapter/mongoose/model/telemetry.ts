import * as mongoose from 'mongoose';

/**
 * 測定スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
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
    },
    {
        collection: 'telemetries',
        id: true,
        read: 'primaryPreferred',
        safe: <any>{ j: 1, w: 'majority', wtimeout: 10000 },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('Telemetry', schema);