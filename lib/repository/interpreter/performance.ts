/**
 * パフォーマンスリポジトリ
 *
 * todo パフォーマンス取得時にpopulateする必要がないようにスキーマを見直す
 *
 * @class PerformanceRepositoryInterpreter
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import Film from '../../model/film';
import Performance from '../../model/performance';
import Screen from '../../model/screen';
import Theater from '../../model/theater';
import PerformanceRepository from '../performance';
import performanceModel from './mongoose/model/performance';

const debug = createDebug('sskts-domain:repository:performance');

export default class PerformanceRepositoryInterpreter implements PerformanceRepository {
    constructor(readonly connection: Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(performanceModel.modelName);
        const docs = await model.find(conditions)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();

        return docs.map((doc) => {
            const object = <any>doc.toObject();
            object.theater = Theater.create(doc.get('theater'));
            object.screen = Screen.create(doc.get('screen'));
            object.film = Film.create(doc.get('film'));

            return Performance.create(object);
        });
    }

    public async findById(id: string) {
        const model = this.connection.model(performanceModel.modelName);
        const doc = await model.findById(id)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();

        if (doc) {
            const object = <any>doc.toObject();
            object.theater = Theater.create(doc.get('theater'));
            object.screen = Screen.create(doc.get('screen'));
            object.film = Film.create(doc.get('film'));

            return monapt.Option(Performance.create(object));
        } else {
            return monapt.None;
        }
    }

    public async store(performance: Performance) {
        const model = this.connection.model(performanceModel.modelName);
        debug('updating a performance...', performance);
        await model.findByIdAndUpdate(performance.id, performance.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
