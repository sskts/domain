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
const COA = require("@motionpicture/coa-service");
const mongoose = require("mongoose");
const sskts = require("../lib/index");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const requiredFields = yield COA.services.master.theater({
            theater_code: '118'
        }).then(sskts.factory.theater.createFromCOA);
        const theater = Object.assign({}, requiredFields, {
            address: {
                en: '',
                ja: ''
            },
            websites: [
                sskts.factory.theater.createWebsite({
                    group: sskts.factory.theaterWebsiteGroup.PORTAL,
                    name: {
                        "en": "portal site",
                        "ja": "ポータルサイト"
                    },
                    url: 'http://devssktsportal.azurewebsites.net/theater/aira/'
                })
            ],
            gmo: {
                site_id: '',
                shop_id: '',
                shop_pass: ''
            }
        });
        yield sskts.service.shop.open(theater)(sskts.adapter.theater(connection));
        mongoose.disconnect();
    });
}
main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
