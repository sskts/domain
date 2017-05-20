import * as mongoose from 'mongoose';

import filmModel from './film';
import ownerModel from './owner';
import performanceModel from './performance';
import screenModel from './screen';
import theaterModel from './theater';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';
import TransactionInquiryKeySchemaType from '../schemaTypes/transactionInquiryKey';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 資産スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        _id: String,
        ownership: { // 所有権
            id: String,
            // todo relationがあると扱いづらいかも？
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: ownerModel.modelName
            },
            authentication_records: { // 認証記録
                type: [{
                    _id: false,
                    when: Date, // いつ
                    where: String, // どこで
                    why: String, // 何のために
                    how: String // どうやって
                }],
                default: []
            }
        },
        authorizations: [mongoose.Schema.Types.Mixed], // 承認リスト
        group: String, // 資産グループ
        price: Number,

        // todo チケットホルダーで参照するのに十分な情報を追加する
        performance: {
            type: String,
            ref: performanceModel.modelName
        },
        performance_day: String,
        performance_time_start: String,
        performance_time_end: String,
        theater: {
            type: String,
            ref: theaterModel.modelName
        },
        theater_name: MultilingualStringSchemaType,
        theater_name_kana: String,
        theater_address: MultilingualStringSchemaType,
        screen: {
            type: String,
            ref: screenModel.modelName
        },
        screen_name: MultilingualStringSchemaType,
        screen_section: String,
        seat_code: String,
        film: {
            type: String,
            ref: filmModel.modelName
        },
        film_name: MultilingualStringSchemaType,
        film_name_kana: String,
        film_name_short: String,
        film_name_original: String,
        film_minutes: Number,
        film_kbn_eirin: String,
        film_kbn_eizou: String,
        film_kbn_joueihousiki: String,
        film_kbn_jimakufukikae: String,
        film_copyright: String,

        transaction_inquiry_key: TransactionInquiryKeySchemaType, // 取引照会キー

        ticket_code: String,
        ticket_name: MultilingualStringSchemaType,
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
    },
    {
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
    }
);

export default mongoose.model('Asset', schema);
