import * as mongoose from 'mongoose';
import ownerModel from './owner';

import TransactionInquiryKeySchemaType from '../schemaTypes/transactionInquiryKey';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 取引スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        expires_at: Date, // 期限切れ予定日時
        status: String,
        owners: [{ // 取引の対象所有者リスト
            type: mongoose.Schema.Types.ObjectId,
            ref: ownerModel.modelName
        }],
        inquiry_key: TransactionInquiryKeySchemaType,
        queues_status: String,
        expired_at: Date, // 期限切れ日時
        started_at: Date, // 開始日時
        closed_at: Date, // 成立日時
        queues_exported_at: Date // キューエクスポート日時
    },
    {
        collection: 'transactions',
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

// キューエクスポート時の検索で使用
schema.index(
    { status: 1, queues_status: 1 }
);

// 取引期限切れ確認等に使用
schema.index(
    { status: 1, expires_at: 1 }
);

// 実行中キューエクスポート監視に使用
schema.index(
    { queues_status: 1, updated_at: 1 }
);

// 取引進行中は、基本的にIDとステータスで参照する
schema.index(
    { _id: 1, status: 1 }
);

// 購入番号から照会の際に使用
schema.index(
    { 'inquiry_key.reserve_num': 1, 'inquiry_key.tel': 1, 'inquiry_key.theater_code': 1, status: 1 }
);

export default mongoose.model('Transaction', schema);
