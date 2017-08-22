"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const safe = { j: 1, w: 'majority', wtimeout: 10000 };
/**
 * GMO通知スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema({
    shop_id: String,
    access_id: String,
    order_id: String,
    status: String,
    job_cd: String,
    amount: String,
    tax: String,
    currency: String,
    forward: String,
    method: String,
    pay_times: String,
    tran_id: String,
    approve: String,
    tran_date: String,
    err_code: String,
    err_info: String,
    pay_type: String // 決済方法
}, {
    collection: 'gmo_notifications',
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
// GMO売上健康診断時に使用
schema.index({ job_cd: 1, tran_date: 1 });
exports.default = mongoose.model('GMONotification', schema);
