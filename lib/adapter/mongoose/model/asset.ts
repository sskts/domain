import * as mongoose from 'mongoose';
import ownerModel from './owner';
import performanceModel from './performance';

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
            authenticated: Boolean
        },
        authorizations: [mongoose.Schema.Types.Mixed], // 承認リスト
        group: String, // 資産グループ
        price: Number,

        performance: {
            type: String,
            ref: performanceModel.modelName
        },
        section: String,
        seat_code: String,
        ticket_code: String,
        ticket_name: {
            ja: String,
            en: String
        },
        ticket_name_kana: String,
        std_price: Number,
        add_price: Number,
        dis_price: Number,
        sale_price: Number,
        mvtk_app_price: Number,
        add_glasses: Number,
        kbn_eisyahousiki: String
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
