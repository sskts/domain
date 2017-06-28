import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 所有者スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        group: String,
        name_first: String,
        name_last: String,
        email: String,
        tel: String,
        name: MultilingualStringSchemaType,
        description: MultilingualStringSchemaType,
        notes: MultilingualStringSchemaType,
        username: String,
        password_hash: String,
        state: String
    },
    {
        collection: 'owners',
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

// 所有者を特定する時に使用
schema.index(
    { group: 1 }
);

// 会員のユーザーネームはユニークに
schema.index({ group: 1, username: 1 }, { unique: true });

export default mongoose.model('Owner', schema);
