import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

const purposeSchema = new mongoose.Schema(
    {
        typeOf: String
    },
    { strict: false }
);

const objectSchema = new mongoose.Schema(
    {
        measuredAt: Date
    },
    { strict: false }
);

const resultSchema = new mongoose.Schema(
    {
        flow: {
            measuredFrom: Date,
            measuredThrough: Date
        },
        stock: {
            measuredAt: Date
        }
    },
    { strict: false }
);

const errorSchema = new mongoose.Schema(
    {},
    { strict: false }
);

/**
 * 測定スキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        result: resultSchema,
        error: errorSchema,
        object: objectSchema,
        startDate: Date,
        endDate: Date,
        purpose: purposeSchema
    },
    {
        collection: 'telemetries',
        id: true,
        read: 'primaryPreferred',
        safe: safe,
        strict: true,
        useNestedStrict: true,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// レポート参照時に使用
schema.index(
    { 'object.measuredAt': 1 }
);

export default mongoose.model('Telemetry', schema);
