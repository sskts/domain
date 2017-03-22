import * as mongoose from 'mongoose';
import filmModel from './film';
import screenModel from './screen';
import theaterModel from './theater';

/**
 * パフォーマンススキーマ
 * todo COAから引き継げていない項目追加
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
        // trailer_time: String, // トレーラー時間(トレーラー含む本編以外の時間（分）)
        // kbn_service: String, // サービス区分(「通常興行」「レイトショー」など)
        // kbn_acoustic: String, // 音響区分
        // name_service_day: String, // サービスデイ名称(「映画の日」「レディースデイ」など ※割引区分、割引コード、特定日等の組み合わせで登録するため名称で連携の方が容易)
        canceled: Boolean // 上映中止フラグ
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
