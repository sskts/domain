/**
 * パフォーマンスリポジトリ
 *
 * @class PerformanceRepositoryInterpreter
 */

import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Performance from '../../model/performance';
import PerformanceRepository from '../performance';
import performanceModel from './mongoose/model/performance';

export default class PerformanceRepositoryInterpreter implements PerformanceRepository {
    constructor(readonly connection: Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(performanceModel.modelName);
        return <Performance[]>await model.find(conditions)
            .populate('film')
            .populate('theater')
            .populate('screen')
            .lean()
            .exec();
    }

    public async findById(id: string) {
        const model = this.connection.model(performanceModel.modelName);
        const performance = <Performance>await model.findOne({ _id: id })
            .populate('film')
            .populate('theater')
            .populate('screen')
            .lean()
            .exec();

        return (performance) ? monapt.Option(performance) : monapt.None;
    }

    public async store(performance: Performance) {
        const model = this.connection.model(performanceModel.modelName);
        await model.findOneAndUpdate({ _id: performance._id }, performance, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
