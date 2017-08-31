import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 人物スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        typeOf: {
            type: String,
            required: true
        },
        group: String,
        givenName: String,
        familyName: String,
        email: String,
        telephone: String,
        name: MultilingualStringSchemaType,
        description: MultilingualStringSchemaType,
        notes: MultilingualStringSchemaType,
        username: String,
        hashedPassword: String,
        memberOf: mongoose.SchemaTypes.Mixed,
        owns: [mongoose.SchemaTypes.Mixed]
    },
    {
        collection: 'people',
        id: true,
        read: 'primaryPreferred',
        safe: safe,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
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
schema.index({ username: 1 }, { unique: true, partialFilterExpression: { username: { $ne: null } } });

export default mongoose.model('People', schema);
