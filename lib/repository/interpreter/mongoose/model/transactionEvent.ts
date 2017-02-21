import * as mongoose from 'mongoose';
import TransactionModel from './transaction';

/**
 * 取引イベントスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TransactionModel.modelName
        },
        group: String,
        occurred_at: Date,
        authorization: mongoose.Schema.Types.Mixed,
        notification: mongoose.Schema.Types.Mixed
    },
    {
        collection: 'transaction_events',
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

export default mongoose.model('TransactionEvent', schema);
