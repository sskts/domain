/**
 * パフォーマンスアダプター
 *
 * @class PerformanceAdapter
 */
import { Connection } from 'mongoose';
import performanceModel from './mongoose/model/performance';

export default class PerformanceAdapter {
    public model: typeof performanceModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(performanceModel.modelName);
    }
}
