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
const SSKTS = require("../lib/sskts-domain");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield SSKTS.OAuthService.sign(process.env.SSKTS_API_REFRESH_TOKEN, 'admin');
        const decoded = yield SSKTS.OAuthService.verify(token);
        console.log(decoded);
    });
}
main().then(() => {
    console.log('main processed.');
}).catch((err) => {
    console.error(err.message);
});
