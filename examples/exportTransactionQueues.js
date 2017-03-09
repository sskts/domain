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
 * 取引キューエクスポート
 *
 * @ignore
 */
const createDebug = require("debug");
const mongoose = require("mongoose");
const sskts = require("../lib/index");
const debug = createDebug('sskts-api:*');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
/**
 * キューエクスポートを実行する
 *
 * @ignore
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionRepository = sskts.createTransactionRepository(mongoose.connection);
        const option = yield transactionRepository.findOneAndUpdate({
            _id: '58c1619daefa8e0c80605e40'
        }, {});
        if (!option.isEmpty) {
            const transaction = option.get();
            debug('transaction is', transaction);
            // 失敗してもここでは戻さない(RUNNINGのまま待機)
            yield sskts.service.transaction.exportQueues(transaction.id.toString())(transactionRepository, sskts.createQueueRepository(mongoose.connection));
        }
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
