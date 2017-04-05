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
 * 劇場取得の例
 *
 * @ignore
 */
const createDebug = require("debug");
const mongoose = require("mongoose");
const util = require("util");
const sskts = require("../lib/index");
const connectionOptions_1 = require("./connectionOptions");
const debug = createDebug('sskts-domain:example:findTheater');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGOLAB_URI, connectionOptions_1.default);
        const theaterOption = yield sskts.service.master.findTheater('118')(sskts.adapter.theater(mongoose.connection));
        // tslint:disable-next-line:no-magic-numbers
        debug(util.inspect(theaterOption.get(), false, 10));
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
