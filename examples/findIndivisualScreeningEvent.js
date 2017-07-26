"use strict";
/**
 * 個々の上映イベント取得
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
const mongoose = require("mongoose");
const sskts = require("../lib/index");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            mongoose.Promise = global.Promise;
            const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
            const event = yield sskts.service.event.findIndividualScreeningEventByIdentifier('11816221020170720301300')(sskts.adapter.event(connection));
            // tslint:disable-next-line:no-console
            console.log(event.get());
        }
        catch (error) {
            console.error(error);
        }
        mongoose.disconnect();
    });
}
main().then(() => {
    // tslint:disable-next-line:no-console
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
