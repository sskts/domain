import * as mongoose from 'mongoose';

import transactionModel from './transaction';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * アプリケーションクライアントイベントスキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        client: String,
        occurredAt: Date,
        url: String,
        label: String,
        category: String,
        action: String,
        message: String,
        notes: String,
        useragent: String,
        location: [Number, Number],
        transaction: {
            type: String,
            ref: transactionModel.modelName
        }
    },
    {
        collection: 'clientEvents',
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

export default mongoose.model('ClientEvent', schema);