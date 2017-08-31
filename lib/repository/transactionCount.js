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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const debug = createDebug('sskts-domain:adapter:transactionCount');
const KEY_PREFIX = 'sskts-domain:transactionCount';
/**
 * 取引数redisレポジトリー
 *
 * @class TransactionCountRepository
 */
class TransactionCountRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    static SCOPE2KEY(scope) {
        return `${KEY_PREFIX}:${factory.transactionScope.scope2String(scope)}`;
    }
    incr(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // redisでカウントアップ
                const key = TransactionCountRepository.SCOPE2KEY(scope);
                const expireAt = moment(scope.readyThrough).add(1, 'minutes').unix();
                const multi = this.redisClient.multi();
                multi.incr([key], debug)
                    .expireat([key, expireAt], debug)
                    .exec((err, replies) => __awaiter(this, void 0, void 0, function* () {
                    debug('incr:', err, replies);
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    // tslint:disable-next-line:no-magic-numbers
                    resolve(parseInt(replies[0], 10));
                }));
            });
        });
    }
    getByScope(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const key = TransactionCountRepository.SCOPE2KEY(scope);
                this.redisClient.get([key], (err, replies) => {
                    debug(`get ${key}`, err, replies);
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    // nullならまだ取引が発生していないので0
                    // tslint:disable-next-line:no-magic-numbers
                    const numberOfTransactions = (replies !== null) ? parseInt(replies, 10) : 0;
                    resolve(numberOfTransactions);
                });
            });
        });
    }
}
exports.default = TransactionCountRepository;
