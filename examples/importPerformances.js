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
            const filmAdapter = sskts.adapter.film(connection);
            const screenAdapter = sskts.adapter.screen(connection);
            const performanceAdapter = sskts.adapter.performance(connection);
            yield performanceAdapter.model.remove({}).exec();
            yield sskts.service.master.importPerformances('118', '20170325', '20170401')(filmAdapter, screenAdapter, performanceAdapter);
        }
        catch (error) {
            console.error(error);
        }
        mongoose.disconnect();
    });
}
main();
