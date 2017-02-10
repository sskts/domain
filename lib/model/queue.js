"use strict";
/**
 * キュー(実行日時つきのタスク)
 *
 * @export
 * @class Queue
 */
class Queue {
    /**
     * Creates an instance of Queue.
     *
     * @param {ObjectId} _id
     * @param {QueueGroup} group キューグループ
     * @param {QueueStatus} status キューステータス
     * @param {Date} run_at 実行予定日時
     * @param {number} max_count_try 最大リトライ回数
     * @param {(Date | null)} last_tried_at 最終試行日時
     * @param {number} count_tried 試行回数
     * @param {Array<string>} results 実行結果リスト
     */
    constructor(_id, group, status, run_at, max_count_try, last_tried_at, count_tried, results) {
        this._id = _id;
        this.group = group;
        this.status = status;
        this.run_at = run_at;
        this.max_count_try = max_count_try;
        this.last_tried_at = last_tried_at;
        this.count_tried = count_tried;
        this.results = results;
        // TODO validation
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Queue;
