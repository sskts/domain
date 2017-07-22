import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * アクションスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        typeOf: String,
        actionStatus: String,
        agent: mongoose.Schema.Types.Mixed,
        seller: mongoose.Schema.Types.Mixed,
        error: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed,
        object: mongoose.Schema.Types.Mixed,
        clientUser: mongoose.Schema.Types.Mixed,
        expires: Date,
        startDate: Date,
        endDate: Date,

        tasksExportedAt: Date,
        tasksExportationStatus: String,
        tasks: [mongoose.Schema.Types.Mixed]
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

// タスクエクスポート時の検索で使用
schema.index(
    { actionStatus: 1, tasksExportationStatus: 1 }
);

// 取引期限切れ確認等に使用
schema.index(
    { actionStatus: 1, expires: 1 }
);

// 実行中タスクエクスポート監視に使用
schema.index(
    { tasksExportationStatus: 1, updatedAt: 1 }
);

// 取引進行中は、基本的にIDとステータスで参照する
schema.index(
    { _id: 1, actionStatus: 1 }
);

// 購入番号から照会の際に使用
// schema.index(
//     { 'inquiryKey.orderNumber': 1, 'inquiryKey.telephone': 1, 'inquiryKey.theaterCode': 1, status: 1 }
// );

// レポート作成時に使用
schema.index({ endDate: 1 });
schema.index({ startDate: 1 });
schema.index({ startDate: 1, endDate: 1 });
schema.index({ actionStatus: 1, startDate: 1 });

export default mongoose.model('Action', schema);
