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
/* tslint:disable */
const mongoose = require("mongoose");
const sskts = require("../lib/index");
const connectionOptions_1 = require("./connectionOptions");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            mongoose.Promise = global.Promise;
            mongoose.connect(process.env.MONGOLAB_URI, connectionOptions_1.default);
            const theater = yield sskts.service.master.findTheater('118')(sskts.adapter.theater(mongoose.connection));
            console.log(theater);
            mongoose.disconnect();
        }
        catch (error) {
            console.error(error);
        }
    });
}
main();
