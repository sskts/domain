import * as mongoose from 'mongoose';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * GMO通知スキーマ
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        shop_id: String, // ショップID
        access_id: String, // 取引ID
        order_id: String, // オーダーID
        status: String, // 現状態
        job_cd: String, // 処理区分
        amount: String, // 利用金額
        tax: String, // 税送料
        currency: String, // 通貨コード
        forward: String, // 仕向先会社コード
        method: String, // 支払方法
        pay_times: String, // 支払回数
        tran_id: String, // トランザクションID
        approve: String, // 承認番号
        tran_date: String, // 処理日付
        err_code: String, // エラーコード
        err_info: String, // エラー詳細コード
        pay_type: String // 決済方法
    },
    {
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
    }
);

// GMO売上健康診断時に使用
schema.index({ job_cd: 1, tran_date: 1 });

export default mongoose.model('GMONotification', schema);
