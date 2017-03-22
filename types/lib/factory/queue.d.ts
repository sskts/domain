/**
 * キューファクトリー
 * キュー(実行日時つきのタスク)
 *
 * @namespace QueueFacroty
 */
import QueueGroup from './queueGroup';
import QueueStatus from './queueStatus';
/**
 * キューインターフェース
 *
 * @export
 * @interface IQueue
 *
 * @param {string} id
 * @param {QueueGroup} group キューグループ
 * @param {QueueStatus} status キューステータス
 * @param {Date} run_at 実行予定日時
 * @param {number} max_count_try 最大リトライ回数
 * @param {(Date | null)} last_tried_at 最終試行日時
 * @param {number} count_tried 試行回数
 * @param {Array<string>} results 実行結果リスト
 */
export interface IQueue {
    id: string;
    group: QueueGroup;
    status: QueueStatus;
    run_at: Date;
    max_count_try: number;
    last_tried_at: Date | null;
    count_tried: number;
    results: string[];
}
