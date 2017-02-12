"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
const SSKTS = require("../lib/sskts-domain");
process.env.MONGOLAB_URI = "mongodb://testsasakiticketmongodbuser:aZHGD262LNsBTQgG9UGQpA6QvbFkKbAhBfxf3vvz@ds056379-a0.mlab.com:56379,ds056379-a1.mlab.com:56372/testsasakiticketmongodb?replicaSet=rs-ds056379";
process.env.SENDGRID_API_KEY = "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";
process.env.GMO_ENDPOINT = "https://pt01.mul-pay.jp";
process.env.COA_ENDPOINT = "http://coacinema.aa0.netvolante.jp";
process.env.COA_REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);
            yield SSKTS.createMasterService().importTheater("118")(SSKTS.createTheaterRepository(mongoose.connection));
        }
        catch (error) {
            console.error(error);
        }
        mongoose.disconnect();
        process.exit(0);
    });
}
main();
