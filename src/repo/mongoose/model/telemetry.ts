import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 測定スキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        flow: {
            transactions: mongoose.Schema.Types.Mixed,
            tasks: mongoose.Schema.Types.Mixed,
            measuredFrom: Date,
            measuredThrough: Date

        },
        stock: {
            transactions: mongoose.Schema.Types.Mixed,
            tasks: mongoose.Schema.Types.Mixed,
            measuredAt: Date
        }
    },
    {
        collection: 'telemetries',
        id: true,
        read: 'primaryPreferred',
        safe: safe,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// レポート参照時に使用
schema.index(
    { 'stock.measuredAt': 1 }
);

export default mongoose.model('Telemetry', schema);
