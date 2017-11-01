import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * タスクスキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        name: String,
        status: String,
        runsAt: Date,
        remainingNumberOfTries: Number,
        lastTriedAt: Date,
        numberOfTried: Number,
        executionResults: [mongoose.Schema.Types.Mixed],
        data: mongoose.Schema.Types.Mixed
    },
    {
        collection: 'tasks',
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

// ID指定でタスク実行に使用
schema.index(
    { _id: 1 }
);

// 取引のタスク検索に使用
schema.index(
    { 'data.transactionId': 1 },
    {
        sparse: true
    }
);

// 基本的にグループごとに、ステータスと実行日時を見て、タスクは実行される
schema.index(
    { name: 1, status: 1, numberOfTried: 1, runsAt: 1 }
);

// ステータス&最終トライ日時&残りトライ可能回数を見て、リトライor中止を決定する
schema.index(
    { remainingNumberOfTries: 1, status: 1, lastTriedAt: 1 }
);

// 測定データ作成時に使用
schema.index({ status: 1, lastTriedAt: 1 });
schema.index({ createdAt: 1, lastTriedAt: 1 });
schema.index({ status: 1, createdAt: 1 });
schema.index({ createdAt: 1 });

export default mongoose.model('Task', schema);
