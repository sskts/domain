import * as mongoose from 'mongoose';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * イベント(公演など)スキーマ
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
        doorTime: Date,
        duration: String,
        endDate: Date,
        eventStatus: String,
        location: mongoose.SchemaTypes.Mixed,
        startDate: Date,
        workPerformed: mongoose.SchemaTypes.Mixed,
        superEvent: mongoose.SchemaTypes.Mixed,
        videoFormat: mongoose.SchemaTypes.Mixed,
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

// 上映イベント検索に使用
schema.index({ typeOf: 1, 'superEvent.location.branchCode': 1, startDate: 1 });
schema.index({ typeOf: 1, startDate: 1 });
schema.index({ typeOf: 1, endDate: 1 });

// 上映イベント取得に使用
schema.index(
    { identifier: 1, typeOf: 1 }
);

export default mongoose.model('Event', schema);
