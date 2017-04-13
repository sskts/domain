import * as mongoose from 'mongoose';
import filmModel from './film';
import screenModel from './screen';
import theaterModel from './theater';

/**
 * パフォーマンススキーマ
 *
 * @ignore
 */
const schema = new mongoose.Schema(
    {
        _id: String,
        theater: {
            type: String,
            ref: theaterModel.modelName
        },
        theater_name: {
            ja: String,
            en: String
        },
        screen: {
            type: String,
            ref: screenModel.modelName
        },
        screen_name: {
            ja: String,
            en: String
        },
        film: {
            type: String,
            ref: filmModel.modelName
        },
        film_name: {
            ja: String,
            en: String
        },
        day: String, // 上映日(※日付は西暦8桁 "YYYYMMDD")
        // time_open: String, // 開演時刻
        time_start: String, // 上映開始時刻
        time_end: String, // 上映終了時刻
        canceled: Boolean, // 上映中止フラグ
        coa_trailer_time: Number, // トレーラー時間(トレーラー含む本編以外の時間（分）)
        coa_kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
        coa_kbn_acoustic: String, // 音響区分
        coa_name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
        coa_available_num: Number, // 購入可能枚数
        coa_rsv_start_date: String, // 予約開始日
        coa_rsv_end_date: String, // 予約終了日
        coa_flg_early_booking: String // 先行予約フラグ
    },
    {
        collection: 'performances',
        id: true,
        read: 'primaryPreferred',
        safe: <any>{ j: 1, w: 'majority', wtimeout: 10000 },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// パフォーマンス検索時に使用
schema.index(
    { theater: 1, day: 1, time_start: 1 }
);

export default mongoose.model('Performance', schema);
