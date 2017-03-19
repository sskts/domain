"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * レポートサービス
 * todo 実験的実装中
 *
 * @namespace ReportService
 */
const createDebug = require("debug");
const transactionStatus_1 = require("../factory/transactionStatus");
const debug = createDebug('sskts-domain:service:report');
function transactionStatuses() {
    return (transactionAdapter) => __awaiter(this, void 0, void 0, function* () {
        debug('counting ready transactions...');
        const nubmerOfReadyTransactions = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.READY,
            expires_at: { $gt: new Date() }
        }).exec();
        debug('counting underway transactions...');
        const nubmerOfUnderwayTransactions = yield transactionAdapter.transactionModel.count({
            status: transactionStatus_1.default.UNDERWAY
        }).exec();
        return {
            nubmerOfReadyTransactions: nubmerOfReadyTransactions,
            nubmerOfUnderwayTransactions: nubmerOfUnderwayTransactions
        };
    });
}
exports.transactionStatuses = transactionStatuses;
