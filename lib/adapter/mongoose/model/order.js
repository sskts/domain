"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * 注文スキーマ
 */
const schema = new mongoose.Schema({
    typeOf: {
        type: String,
        required: true
    },
    seller: mongoose.SchemaTypes.Mixed,
    customer: mongoose.SchemaTypes.Mixed,
    orderNumber: String,
    price: Number,
    priceCurrency: String,
    acceptedOffers: [mongoose.SchemaTypes.Mixed],
    paymentMethods: [mongoose.SchemaTypes.Mixed],
    discounts: [mongoose.SchemaTypes.Mixed],
    url: String,
    orderStatus: String,
    orderDate: Date,
    isGift: Boolean,
    orderInquiryKey: mongoose.SchemaTypes.Mixed
}, {
    collection: 'orders',
    id: true,
    read: 'primaryPreferred',
    safe: safe,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    toJSON: { getters: true },
    toObject: { getters: true }
});
exports.default = mongoose.model('Order', schema);
