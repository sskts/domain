"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* tslint:disable */
const mongoose = require("mongoose");
const SSKTS = require("../lib/index");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            mongoose.Promise = global.Promise;
            const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
            yield SSKTS.MasterService.importScreens('118')(SSKTS.createTheaterRepository(connection), SSKTS.createScreenRepository(connection));
        }
        catch (error) {
            console.error(error);
        }
        process.exit(0);
    });
}
main();
