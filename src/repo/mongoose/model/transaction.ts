import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 取引スキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        status: String,
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
        tasksExportationStatus: String
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
    { tasksExportationStatus: 1, status: 1 }
);

// 取引期限切れ確認等に使用
schema.index(
    { status: 1, expires: 1 }
);

// 実行中タスクエクスポート監視に使用
schema.index(
    { tasksExportationStatus: 1, updatedAt: 1 }
);

// 取引進行中は、基本的にIDとステータスで参照する
schema.index(
    { status: 1, typeOf: 1, _id: 1 }
);

// 購入番号から照会の際に使用
schema.index(
    {
        'result.order.orderInquiryKey.confirmationNumber': 1,
        'result.order.orderInquiryKey.telephone': 1,
        'result.order.orderInquiryKey.theaterCode': 1,
        status: 1
    }
);

// LINEアシスタントでの取引照会に使用
schema.index(
    {
        'result.order.orderInquiryKey.theaterCode': 1,
        'result.order.orderInquiryKey.confirmationNumber': 1
    }
);

// 結果の注文番号はユニークなはず
schema.index(
    {
        'result.order.orderNumber': 1
    },
    {
        unique: true,
        sparse: true
    }
);

// レポート作成時に使用
schema.index({ startDate: 1 });
schema.index({ startDate: 1, endDate: 1 });
schema.index({ status: 1, startDate: 1 });

// 取引タイプ指定で取得する場合に使用
schema.index(
    {
        typeOf: 1,
        _id: 1
    }
);

export default mongoose.model('Transaction', schema);
