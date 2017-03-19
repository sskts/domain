import * as mongoose from 'mongoose';
import ownerModel from './owner';

/**
 * 取引スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        expires_at: Date,
        status: String,
        owners: [{ // 取引の対象所有者リスト
            type: mongoose.Schema.Types.ObjectId,
            ref: ownerModel.modelName
        }],
        inquiry_key: {
            _id: false,
            theater_code: String, // 照会劇場コード
            reserve_num: Number, // 照会ID
            tel: String // 照会PASS
        },
        queues_status: String
    },
    {
        collection: 'transactions',
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

// キューエクスポート時の検索で使用
schema.index(
    {
        status: 1,
        queues_status: 1
    }
);

// 取引期限切れ確認等に使用
schema.index(
    {
        status: 1,
        expires_at: 1
    }
);

// 実行中キューエクスポート監視に使用
// todo updated_atでの確認仕様を見直し
schema.index(
    {
        queues_status: 1,
        updated_at: 1
    }
);

export default mongoose.model('Transaction', schema);
