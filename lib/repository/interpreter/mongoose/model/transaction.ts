import mongoose = require("mongoose");
import OwnerModel from "./owner";

/**
 * 取引スキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        expired_at: Date,
        status: String,
        events: [mongoose.Schema.Types.Mixed],
        owners: [{ // 取引の対象所有者リスト
            type: mongoose.Schema.Types.ObjectId,
            ref: OwnerModel.modelName
        }],
        queues: [mongoose.Schema.Types.Mixed],
        inquiry_key: {
            theater_code: String, // 照会劇場コード
            reserve_num: Number, // 照会ID
            tel: String // 照会PASS
        },
        queues_status: String
    }, {
        collection: "transactions",
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

export default mongoose.model("Transaction", schema);