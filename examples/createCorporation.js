"use strict";
/**
 * 企業作成サンプル
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
        const organizationAdapter = sskts.adapter.organization(mongoose.connection);
        const corporation = sskts.factory.organization.corporation.create({
            identifier: sskts.factory.organizationIdentifier.corporation.SasakiKogyo,
            name: {
                ja: '佐々木興業株式会社',
                en: 'Cinema Sunshine Co., Ltd.'
            },
            legalName: {
                ja: '佐々木興業株式会社',
                en: 'Cinema Sunshine Co., Ltd.'
            }
        });
        yield organizationAdapter.organizationModel.findOneAndUpdate({
            identifier: corporation.identifier,
            typeOf: sskts.factory.organizationType.Corporation
        }, corporation, { upsert: true }).exec();
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
