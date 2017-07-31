import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 組織スキーマ
 */
const schema = new mongoose.Schema(
    {
        typeOf: {
            type: String,
            required: true
        },
        identifier: String,
        name: MultilingualStringSchemaType,
        legalName: MultilingualStringSchemaType,
        sameAs: String,
        url: String,
        gmoInfo: mongoose.SchemaTypes.Mixed,
        parentOrganization: mongoose.SchemaTypes.Mixed,
        location: mongoose.SchemaTypes.Mixed
    },
    {
        collection: 'organizations',
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

export default mongoose.model('Organization', schema);
