import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 測定スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        flow: {
            transactions: mongoose.Schema.Types.Mixed,
            queues: mongoose.Schema.Types.Mixed,
            measured_from: Date,
            measured_to: Date

        },
        stock: {
            transactions: mongoose.Schema.Types.Mixed,
            queues: mongoose.Schema.Types.Mixed,
            measured_at: Date
        }
    },
    {
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
    }
);

export default mongoose.model('Telemetry', schema);
