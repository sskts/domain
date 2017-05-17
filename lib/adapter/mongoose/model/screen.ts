import * as mongoose from 'mongoose';

import theaterModel from './theater';

import MultilingualStringSchemaType from '../schemaTypes/multilingualString';

const safe: any = { j: 1, w: 'majority', wtimeout: 10000 };

/**
 * スクリーンスキーマ
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
        coa_screen_code: String,
        name: MultilingualStringSchemaType,
        seats_number: Number, // 座席合計数
        seats_numbers_by_seat_grade: [{ // 座席グレードごとの座席数
            _id: false,
            seat_grade_code: String, // 座席グレードコード
            seats_number: Number
        }],
        sections: [
            {
                _id: false,
                code: String,
                name: MultilingualStringSchemaType,
                seats: [
                    {
                        _id: false,
                        code: String, // 座席コード
                        grade: {
                            code: String, // 座席グレードコード
                            name: MultilingualStringSchemaType,
                            additional_charge: Number // 追加料金
                        }
                    }
                ]
            }
        ]
    },
    {
        collection: 'screens',
        id: true,
        read: 'primaryPreferred',
        safe: safe,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('Screen', schema);
