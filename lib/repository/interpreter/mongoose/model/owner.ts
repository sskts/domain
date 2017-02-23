import * as mongoose from 'mongoose';

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

        name: {
            ja: String,
            en: String
        }
    },
    {
        collection: 'owners',
        id: true,
        read: 'primaryPreferred',
        safe: <any>{ j: 1, w: 'majority', wtimeout: 5000 },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('Owner', schema);
