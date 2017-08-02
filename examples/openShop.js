"use strict";
/**
 * 劇場ショップオープンサンプル
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
const url = require("url");
const sskts = require("../lib/index");
const debug = createDebug('sskts-domain:examples');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const organizationAdapter = sskts.adapter.organization(mongoose.connection);
        const movieTheater = sskts.factory.organization.movieTheater.create({
            name: {
                en: 'CinemasunshineTest118',
                ja: 'シネマサンシャイン１１８'
            },
            branchCode: '118',
            gmoInfo: {
                shopPass: 'xbxmkaa6',
                shopId: 'tshop00026096',
                siteId: 'tsite00022126'
            },
            parentOrganization: {
                typeOf: sskts.factory.organizationType.Corporation,
                identifier: sskts.factory.organizationIdentifier.corporation.SasakiKogyo,
                name: {
                    en: 'Cinema Sunshine Co., Ltd.',
                    ja: '佐々木興業株式会社'
                }
            },
            location: {
                typeOf: 'MovieTheater',
                branchCode: '118',
                name: {
                    en: 'CinemasunshineTest118',
                    ja: 'シネマサンシャイン１１８'
                }
            },
            telephone: '0312345678',
            // tslint:disable-next-line:no-http-string
            url: sskts.factory.url.create(new url.URL('http://devssktsportal.azurewebsites.net/theater/aira/'))
        });
        yield sskts.service.shop.open(movieTheater)(organizationAdapter);
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
