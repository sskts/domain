import * as mongoose from 'mongoose';

const safe = { j: true, w: 'majority', wtimeout: 10000 };

const ownedBySchema = new mongoose.Schema(
    {},
    {
        id: false,
        _id: false,
        strict: false
    }
);

const acquiredFromSchema = new mongoose.Schema(
    {},
    {
        id: false,
        _id: false,
        strict: false
    }
);

const typeOfGoodSchema = new mongoose.Schema(
    {},
    {
        id: false,
        _id: false,
        strict: false
    }
);

/**
 * 所有権スキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        typeOf: {
            type: String,
            required: true
        },
        identifier: String,
        ownedBy: ownedBySchema,
        acquiredFrom: acquiredFromSchema,
        ownedFrom: Date,
        ownedThrough: Date,
        typeOfGood: typeOfGoodSchema
    },
    {
        collection: 'ownershipInfos',
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

schema.index(
    { createdAt: 1 },
    { name: 'searchByCreatedAt' }
);
schema.index(
    { updatedAt: 1 },
    { name: 'searchByUpdatedAt' }
);
schema.index(
    { typeOf: 1 },
    { name: 'searchByTypeOf' }
);
schema.index(
    { 'acquiredFrom.id': 1 },
    {
        name: 'searchByAcquiredFromId',
        partialFilterExpression: {
            'acquiredFrom.id': { $exists: true }
        }
    }
);
schema.index(
    { 'typeOfGood.typeOf': 1 },
    {
        name: 'searchByTypeOfGoodTypeOf',
        partialFilterExpression: {
            'typeOfGood.typeOf': { $exists: true }
        }
    }
);

// identifierはユニーク
schema.index(
    { identifier: 1 },
    { unique: true }
);

// 所有権検索時に使用
schema.index(
    {
        'typeOfGood.typeOf': 1,
        'ownedBy.memberOf.membershipNumber': 1,
        ownedFrom: 1,
        ownedThrough: 1
    },
    {
        name: 'searchByOwner',
        partialFilterExpression: {
            'ownedBy.memberOf.membershipNumber': { $exists: true }
        }
    }
);
schema.index(
    {
        'ownedBy.id': 1
    },
    {
        name: 'searchByOwnerId',
        partialFilterExpression: {
            'ownedBy.id': { $exists: true }
        }
    }
);

// トークンで所有権検索時に使用
schema.index(
    {
        'typeOfGood.reservedTicket.ticketToken': 1
    },
    {
        name: 'searchByTicketToken',
        partialFilterExpression: {
            'typeOfGood.reservedTicket.ticketToken': { $exists: true }
        }
    }
);

export default mongoose.model('OwnershipInfo', schema).on(
    'index',
    // tslint:disable-next-line:no-single-line-block-comment
    /* istanbul ignore next */
    (error) => {
        if (error !== undefined) {
            console.error(error);
        }
    }
);
