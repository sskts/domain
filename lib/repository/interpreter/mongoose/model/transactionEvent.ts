import * as mongoose from 'mongoose';
import transactionModel from './transaction';

/**
 * 取引イベントスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: transactionModel.modelName
        },
        group: String,
        occurred_at: Date,
        authorization: mongoose.Schema.Types.Mixed,
        notification: mongoose.Schema.Types.Mixed
    },
    {
        collection: 'transaction_events',
        id: true,
        read: 'primaryPreferred',
        safe: <any>{ j: 1, w: 'majority', wtimeout: 5000 },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('TransactionEvent', schema);
