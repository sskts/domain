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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            mongoose.Promise = global.Promise;
            const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
            const performance = yield sskts.service.master.findPerformance('1182017022848278022120')(sskts.createPerformanceRepository(connection));
            console.log(performance);
        }
        catch (error) {
            console.error(error);
        }
        mongoose.disconnect();
    });
}
main();
