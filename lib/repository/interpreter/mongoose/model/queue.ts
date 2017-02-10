import mongoose = require("mongoose");

/**
 * キュースキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    group: String,
    status: String,
    run_at: Date,
    max_count_try: Number,
    last_tried_at: Date,
    count_tried: Number,
    results: [String],

    authorization: mongoose.Schema.Types.Mixed, // オーソリタスク
    notification: mongoose.Schema.Types.Mixed, // 通知タスク
    transaction_id: mongoose.Schema.Types.ObjectId, // 取引タスク
}, {
        collection: "queues",
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    });

export default mongoose.model("Queue", schema);