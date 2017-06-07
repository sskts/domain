"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引数redisアダプター
 *
 * @class TransactionCountAdapter
 */
class TransactionCountAdapter {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
}
TransactionCountAdapter.KEY_PREFIX = 'sskts-domain:transactionCount';
exports.default = TransactionCountAdapter;
