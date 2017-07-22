import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * イベント(公演など)スキーマ
 */
const schema = new mongoose.Schema(
    {
        typeOf: String,
        identifier: String,
        name: MultilingualStringSchemaType,
        description: MultilingualStringSchemaType,
        doorTime: Date,
        duration: String,
        endDate: Date,
        eventStatus: String,
        location: mongoose.SchemaTypes.Mixed,
        startDate: Date,
        workPerformed: mongoose.SchemaTypes.Mixed,
        superEvent: mongoose.SchemaTypes.Mixed,
        videoFormat: String,
        kanaName: String,
        alternativeHeadline: String,
        coaInfo: mongoose.SchemaTypes.Mixed
    },
    {
        collection: 'events',
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

export default mongoose.model('Event', schema);
