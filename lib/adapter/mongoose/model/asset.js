"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const film_1 = require("./film");
const owner_1 = require("./owner");
const performance_1 = require("./performance");
const screen_1 = require("./screen");
const theater_1 = require("./theater");
const multilingualString_1 = require("../schemaTypes/multilingualString");
const transactionInquiryKey_1 = require("../schemaTypes/transactionInquiryKey");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 資産スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    _id: String,
    ownership: {
        id: String,
        // todo relationがあると扱いづらいかも？
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: owner_1.default.modelName
        },
        authentication_records: {
            type: [{
                    _id: false,
                    when: Date,
                    where: String,
                    why: String,
                    how: String // どうやって
                }],
            default: []
        }
    },
    authorizations: [mongoose.Schema.Types.Mixed],
    group: String,
    price: Number,
    // todo チケットホルダーで参照するのに十分な情報を追加する
    performance: {
        type: String,
        ref: performance_1.default.modelName
    },
    performance_day: String,
    performance_time_start: String,
    performance_time_end: String,
    theater: {
        type: String,
        ref: theater_1.default.modelName
    },
    theater_name: multilingualString_1.default,
    theater_name_kana: String,
    theater_address: multilingualString_1.default,
    screen: {
        type: String,
        ref: screen_1.default.modelName
    },
    screen_name: multilingualString_1.default,
    screen_section: String,
    seat_code: String,
    film: {
        type: String,
        ref: film_1.default.modelName
    },
    film_name: multilingualString_1.default,
    film_name_kana: String,
    film_name_short: String,
    film_name_original: String,
    film_minutes: Number,
    film_kbn_eirin: String,
    film_kbn_eizou: String,
    film_kbn_joueihousiki: String,
    film_kbn_jimakufukikae: String,
    film_copyright: String,
    transaction_inquiry_key: transactionInquiryKey_1.default,
    ticket_code: String,
    ticket_name: multilingualString_1.default,
    ticket_name_kana: String,
    std_price: Number,
    add_price: Number,
    dis_price: Number,
    sale_price: Number,
    mvtk_app_price: Number,
    add_glasses: Number,
    kbn_eisyahousiki: String,
    mvtk_num: String,
    mvtk_kbn_denshiken: String,
    mvtk_kbn_maeuriken: String,
    mvtk_kbn_kensyu: String,
    mvtk_sales_price: Number
}, {
    collection: 'assets',
    id: true,
    read: 'primaryPreferred',
    safe: safe,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
exports.default = mongoose.model('Asset', schema);
