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
 * COA仮予約資産移動
 *
 * @ignore
 */
const mongoose = require("mongoose");
const util = require("util");
const sskts = require("../lib/index");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI);
        const queueAdapter = sskts.createQueueAdapter(mongoose.connection);
        const assetAdapter = sskts.createAssetAdapter(mongoose.connection);
        // 未実行のCOA資産移動キューを取得
        const option = yield queueAdapter.findOneSettleCOASeatReservationAuthorizationAndUpdate({
            _id: '58c1262196970616d0fe2e30'
        }, {});
        if (!option.isEmpty) {
            const queue = option.get();
            console.log(util.inspect(queue, { showHidden: true, depth: 10 }));
            try {
                // 失敗してもここでは戻さない(RUNNINGのまま待機)
                yield sskts.service.stock.transferCOASeatReservation(queue.authorization)(assetAdapter);
            }
            catch (error) {
                console.error(error);
            }
        }
        mongoose.disconnect();
    });
}
main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
