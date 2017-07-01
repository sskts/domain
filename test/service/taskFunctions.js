"use strict";
/**
 * タスクファンクションサービス
 *
 * @namespace service/taskFunctions
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:taskFunctions');
function sendEmailNotification(task) {
    debug('executing...', task);
}
exports.sendEmailNotification = sendEmailNotification;
/**
 * メール送信キュー実行
 *
 * @returns {QueueOperation<void>}
 * @memberof service/queue
 */
// export function executeSendEmailNotification(): QueueOperation<void> {
//     return async (queueAdapter: QueueAdapter) => {
//         await notificationService.sendEmail(queueDoc.get('notification'))();
//     };
// }
/**
 * COA仮予約キャンセルキュー実行
 *
 * @returns {QueueOperation<void>}
 * @memberof service/queue
 */
// export function executeCancelCOASeatReservationAuthorization(): QueueOperation<void> {
//     return async (queueAdapter: QueueAdapter) => {
//         await stockService.unauthorizeCOASeatReservation(queueDoc.get('authorization'))();
//     };
// }
/**
 * GMO仮売上取消キュー実行
 *
 * @returns {QueueOperation<void>}
 * @memberof service/queue
 */
// export function executeCancelGMOAuthorization(): QueueOperation<void> {
//     return async (queueAdapter: QueueAdapter) => {
//         await salesService.cancelGMOAuth(queueDoc.get('authorization'))();
//     };
// }
/**
 * ムビチケ着券取消キュー実行
 *
 * @returns {QueueOperation<void>}
 * @memberof service/queue
 */
// export function executeCancelMvtkAuthorization(): QueueOperation<void> {
//     return async (queueAdapter: QueueAdapter) => {
//         await salesService.cancelMvtkAuthorization(queueDoc.get('authorization'))();
//     };
// }
/**
 * 取引照会無効化キュー実行
 *
 * @returns {QueueAndTransactionOperation<void>}
 * @memberof service/queue
 */
// export function executeDisableTransactionInquiry(): QueueAndTransactionOperation<void> {
//     return async (queueAdapter: QueueAdapter, transactionAdapter: TransactionAdapter) => {
//         await stockService.disableTransactionInquiry(queueDoc.get('transaction'))(transactionAdapter);
//     };
// }
/**
 * COA本予約キュー実行
 *
 * @returns {AssetAndQueueOperation<void>}
 * @memberof service/queue
 */
// export function executeSettleCOASeatReservationAuthorization(): AssetAndOwnerAndPerformanceAndQueueOperation<void> {
//     // tslint:disable-next-line:max-line-length
//     return async (
//         assetAdapter: AssetAdapter,
//         ownerAdapter: OwnerAdapter,
//         performanceAdapter: PerformanceAdapter,
//         queueAdapter: QueueAdapter
//     ) => {
//         await stockService.transferCOASeatReservation(queueDoc.get('authorization'))(
//             assetAdapter, ownerAdapter, performanceAdapter
//         );
//     };
// }
/**
 * GMO実売上キュー実行
 *
 * @returns {QueueOperation<void>}
 * @memberof service/queue
 */
// export function executeSettleGMOAuthorization(): QueueOperation<void> {
//     return async (queueAdapter: QueueAdapter) => {
//         await salesService.settleGMOAuth(queueDoc.get('authorization'))();
//     };
// }
/**
 * ムビチケ資産移動キュー実行
 *
 * @returns {QueueOperation<void>}
 * @memberof service/queue
 */
// export function executeSettleMvtkAuthorization(): QueueOperation<void> {
//     return async (queueAdapter: QueueAdapter) => {
//         await salesService.settleMvtkAuthorization(queueDoc.get('authorization'))();
//     };
// }
