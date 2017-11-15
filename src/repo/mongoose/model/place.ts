import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * 場所スキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        typeOf: {
            type: String,
            required: true
        },
        identifier: String,
        name: MultilingualStringSchemaType,
        description: MultilingualStringSchemaType,
        address: MultilingualStringSchemaType,
        branchCode: String,
        containedInPlace: mongoose.SchemaTypes.Mixed,
        containsPlace: mongoose.SchemaTypes.Mixed,
        maximumAttendeeCapacity: Number,
        openingHoursSpecification: mongoose.SchemaTypes.Mixed,
        smokingAllowed: Boolean,
        telephone: String,
        sameAs: String,
        url: String,
        kanaName: String,
        coaInfo: mongoose.SchemaTypes.Mixed
    },
    {
        collection: 'places',
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

// 劇場検索に使用
schema.index(
    { branchCode: 1, typeOf: 1 }
);

export default mongoose.model('Place', schema);
