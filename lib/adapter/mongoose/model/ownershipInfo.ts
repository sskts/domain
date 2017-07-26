import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 所有権スキーマ
 */
const schema = new mongoose.Schema(
    {
        typeOf: {
            type: String,
            required: true
        },
        identifier: String,
        acquiredFrom: mongoose.SchemaTypes.Mixed,
        ownedFrom: Date,
        ownedThrough: Date,
        typeOfGood: mongoose.SchemaTypes.Mixed
    },
    {
        collection: 'ownershipInfos',
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

export default mongoose.model('OwnershipInfo', schema);
