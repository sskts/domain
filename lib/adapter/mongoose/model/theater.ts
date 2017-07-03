import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 劇場スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        _id: String,
        name: MultilingualStringSchemaType,
        name_kana: String,
        address: MultilingualStringSchemaType,
        gmo: { // 劇場ごとにGMOショップが異なる可能性があるため
            _id: false,
            site_id: String,
            shop_id: String,
            shop_pass: String
        },
        websites: [{
            _id: false,
            group: String,
            name: MultilingualStringSchemaType,
            url: String
        }]
    },
    {
        collection: 'theaters',
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

export default mongoose.model('Theater', schema);
