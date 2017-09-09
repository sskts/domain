import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * アクションスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        actionStatus: String,
        typeOf: String,
        agent: mongoose.Schema.Types.Mixed,
        recipient: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
        error: mongoose.Schema.Types.Mixed,
        object: mongoose.Schema.Types.Mixed,
        startDate: Date,
        endDate: Date,
        purpose: mongoose.Schema.Types.Mixed
    },
    {
        collection: 'actions',
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

export default mongoose.model('Action', schema);
