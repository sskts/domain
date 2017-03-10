/**
 * パフォーマンスリポジトリ
 *
 * todo パフォーマンス取得時にpopulateする必要がないようにスキーマを見直す
 *
 * @class PerformanceAdapterInterpreter
 */

import * as clone from 'clone';
import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import * as Performance from '../../factory/performance';
import PerformanceAdapter from '../performance';
import performanceModel from './mongoose/model/performance';

const debug = createDebug('sskts-domain:adapter:performance');

export default class PerformanceAdapterInterpreter implements PerformanceAdapter {
    private model: typeof performanceModel;

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

    public async findById(id: string): Promise<monapt.Option<Performance.IPerformanceWithFilmAndScreen>> {
        const doc = await this.model.findById(id)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();

        if (doc) {
            return monapt.Option(
                {
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
                }
            );
        } else {
            return monapt.None;
        }
    }

    public async store(performance: Performance.IPerformance) {
        debug('updating a performance...', performance);
        const update = clone(performance);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
