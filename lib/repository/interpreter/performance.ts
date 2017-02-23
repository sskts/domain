/**
 * パフォーマンスリポジトリ
 *
 * @class PerformanceRepositoryInterpreter
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Performance from '../../model/performance';
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

        return docs.map((doc) => Performance.create(<any>doc.toObject()));
    }

    public async findById(id: string) {
        const model = this.connection.model(performanceModel.modelName);
        const doc = await model.findOne({ _id: id })
            .populate('film')
            .populate('theater')
            .populate('screen')
            .exec();

        return (doc) ? monapt.Option(Performance.create(<any>doc.toObject())) : monapt.None;
    }

    public async store(performance: Performance) {
        const model = this.connection.model(performanceModel.modelName);
        debug('updating a performance...', performance);
        await model.findOneAndUpdate({ _id: performance.id }, performance.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
