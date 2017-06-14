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
const createDebug = require("debug");
const TransactionScopeFactory = require("../factory/transactionScope");
const debug = createDebug('sskts-domain:adapter:transactionCount');
/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
class TransactionCountAdapter {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    static SCOPE2KEY(scope) {
        return `${TransactionCountAdapter.KEY_PREFIX}:${TransactionScopeFactory.scope2String(scope)}`;
    }
    incr(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // redisでカウントアップ
                // ここで本来expireコマンドもセットしないと不要なデータが残ってしまうが、
                // 少しでもパフォーマンスを上げるために、不要なデータの削除は別タスクで行う想定
                const key = TransactionCountAdapter.SCOPE2KEY(scope);
                this.redisClient.incr([key], (err, replies) => {
                    debug('incr:', err, replies);
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    // カウント単位あたりの取引最大数を超過しているかどうか
                    // tslint:disable-next-line:no-magic-numbers
                    resolve(parseInt(replies, 10));
                });
            });
        });
    }
    getByScope(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const key = TransactionCountAdapter.SCOPE2KEY(scope);
                this.redisClient.get([key], (err, replies) => {
                    debug(`get ${key}`, err, replies);
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    // tslint:disable-next-line:no-magic-numbers
                    const numberOfTransactions = (replies !== null) ? parseInt(replies, 10) : 0;
                    resolve(numberOfTransactions);
                });
            });
        });
    }
}
TransactionCountAdapter.KEY_PREFIX = 'sskts-domain:transactionCount';
exports.default = TransactionCountAdapter;
