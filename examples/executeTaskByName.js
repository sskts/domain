"use strict";
/**
 * タスク名でタスクを実行するサンプル
 *
 * @ignore
 */
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
const mongoose = require("mongoose");
const sskts = require("../lib/index");
const debug = createDebug('sskts-domain:examples');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sskts.service.task.executeByName(sskts.factory.taskName.SettleSeatReservationAuthorization)(sskts.adapter.task(mongoose.connection), mongoose.connection);
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
