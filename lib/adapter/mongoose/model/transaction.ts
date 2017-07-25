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
        client_user: mongoose.Schema.Types.Mixed,
        inquiry_key: TransactionInquiryKeySchemaType,
        expired_at: Date, // 期限切れ日時
        started_at: Date, // 開始日時
        closed_at: Date, // 成立日時
        tasks_exported_at: Date,
        tasks_exportation_status: String,

        typeOf: String,
        agent: mongoose.Schema.Types.Mixed,
        seller: mongoose.Schema.Types.Mixed,
        error: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
        object: mongoose.Schema.Types.Mixed,
        expires: Date,
        startDate: Date,
        endDate: Date,

        tasksExportedAt: Date,
        tasksExportationStatus: String,
        tasks: [mongoose.Schema.Types.Mixed]
    },
    {
        collection: 'transactions',
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

// タスクエクスポート時の検索で使用
schema.index(
    { status: 1, tasks_exportation_status: 1 }
);

// 取引期限切れ確認等に使用
schema.index(
    { status: 1, expires_at: 1 }
);

// 実行中タスクエクスポート監視に使用
schema.index(
    { tasks_exportation_status: 1, updated_at: 1 }
);

// 取引進行中は、基本的にIDとステータスで参照する
schema.index(
    { _id: 1, status: 1 }
);

// 購入番号から照会の際に使用
schema.index(
    { 'inquiry_key.reserve_num': 1, 'inquiry_key.tel': 1, 'inquiry_key.theater_code': 1, status: 1 }
);

// レポート作成時に使用
schema.index({ closed_at: 1 });
schema.index({ expired_at: 1 });
schema.index({ started_at: 1 });
schema.index({ started_at: 1, closed_at: 1 });
schema.index({ started_at: 1, expired_at: 1 });
schema.index({ status: 1, started_at: 1 });

export default mongoose.model('Transaction', schema);
