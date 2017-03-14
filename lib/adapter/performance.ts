/**
 * パフォーマンスリポジトリ
 *
 * todo パフォーマンス取得時にpopulateする必要がないようにスキーマを見直す
 *
 * @class PerformanceAdapter
 */
import { Connection } from 'mongoose';

import * as Performance from '../factory/performance';
import performanceModel from './mongoose/model/performance';

export default class PerformanceAdapter {
    public model: typeof performanceModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(performanceModel.modelName);
    }

    public async find(conditions: any): Promise<Performance.IPerformanceWithFilmAndScreen[]> {
        const docs = await this.model.find(conditions)
            .setOptions({ maxTimeMS: 10000 })
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();

        return docs.map((doc) => {
            return {
                id: doc.get('id'),
                theater: {
                    id: doc.get('theater').id,
                    name: doc.get('theater').name
                },
                screen: {
                    id: doc.get('screen').id,
                    name: doc.get('screen').name
                },
                film: {
                    id: doc.get('film').id,
                    name: doc.get('film').name,
                    name_kana: doc.get('film').name_kana,
                    name_short: doc.get('film').name_short,
                    name_original: doc.get('film').name_original,
                    minutes: doc.get('film').minutes
                },
                day: doc.get('day'),
                time_start: doc.get('time_start'),
                time_end: doc.get('time_end'),
                canceled: doc.get('canceled')
            };
        });
    }
}
