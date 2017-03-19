import * as mongoose from 'mongoose';

/**
 * キュースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        group: String,
        status: String,
        run_at: Date,
        max_count_try: Number,
        last_tried_at: Date,
        count_tried: Number,
        results: [String],

        authorization: mongoose.Schema.Types.Mixed, // オーソリタスク
        notification: mongoose.Schema.Types.Mixed, // 通知タスク
        transaction: mongoose.Schema.Types.Mixed // 取引タスク
    },
    {
        collection: 'queues',
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

// 基本的にグループごとに、ステータスと実行日時を見て、キューは実行される
schema.index(
    {
        group: 1,
        status: 1,
        run_at: 1
    }
);

// ステータスと最終試行日時を見て、リトライor中止を決定する
schema.index(
    {
        status: 1,
        last_tried_at: 1
    }
);

export default mongoose.model('Queue', schema);
