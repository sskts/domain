"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * タスクスキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    name: String,
    status: String,
    runs_at: Date,
    max_number_of_try: Number,
    last_tried_at: Date,
    number_of_tried: Number,
    execution_results: [mongoose.Schema.Types.Mixed],
    data: mongoose.Schema.Types.Mixed
}, {
    collection: 'tasks',
    id: true,
    read: 'primaryPreferred',
    safe: safe,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
// 基本的にグループごとに、ステータスと実行日時を見て、タスクは実行される
schema.index({ name: 1, status: 1, number_of_tried: 1, runs_at: 1 });
// ステータスと最終試行日時を見て、リトライor中止を決定する
schema.index({ status: 1, last_tried_at: 1 });
exports.default = mongoose.model('Task', schema);
