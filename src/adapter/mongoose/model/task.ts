import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * タスクスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        name: String,
        status: String,
        runs_at: Date,
        remaining_number_of_tries: Number,
        last_tried_at: Date,
        number_of_tried: Number,
        execution_results: [mongoose.Schema.Types.Mixed],
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

// 基本的にグループごとに、ステータスと実行日時を見て、タスクは実行される
schema.index(
    { name: 1, status: 1, numberOfTried: 1, runsAt: 1 }
);

// ステータス&最終トライ日時&残りトライ可能回数を見て、リトライor中止を決定する
schema.index(
    { status: 1, lastTriedAt: 1, remainingNumberOfTries: 1 }
);

export default mongoose.model('Task', schema);
