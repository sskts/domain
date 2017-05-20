"use strict";
/**
 * 座席予約資産移動
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
const debug = createDebug('sskts-domain:examples:transferCOASeatReservation');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const assetAdapter = sskts.adapter.asset(connection);
        const ownerAdapter = sskts.adapter.owner(connection);
        const performanceAdapter = sskts.adapter.performance(connection);
        const authorization = {
            id: '58f59462a6abf8213892d9ed',
            group: 'COA_SEAT_RESERVATION',
            coa_tmp_reserve_num: 122,
            coa_theater_code: '018',
            coa_date_jouei: '20170419',
            coa_title_code: '16324',
            coa_title_branch_num: '0',
            coa_time_begin: '1455',
            coa_screen_code: '30',
            price: 1100,
            owner_from: '5868e16789cc75249cdbfa4b',
            owner_to: '58f59451a6abf8213892d9d8',
            assets: [
                {
                    id: '58f59462a6abf8213892d9ec',
                    ownership: {
                        id: '58f59462a6abf8213892d9eb',
                        owner: '58f59451a6abf8213892d9d8',
                        authentication_records: []
                    },
                    group: 'SEAT_RESERVATION',
                    price: 1100,
                    authorizations: [],
                    performance: '01820170419163240301455',
                    screen_section: '   ',
                    seat_code: 'Ｉ－１０',
                    ticket_code: '1000051',
                    ticket_name: {
                        ja: 'ｼﾆｱ',
                        en: ''
                    },
                    ticket_name_kana: 'ｼﾆｱ',
                    std_price: 1100,
                    add_price: 0,
                    dis_price: 0,
                    sale_price: 1100,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00'
                }
            ]
        };
        yield sskts.service.stock.transferCOASeatReservation(authorization)(assetAdapter, ownerAdapter, performanceAdapter);
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
