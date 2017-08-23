import { Connection } from 'mongoose';
import performanceModel from './mongoose/model/performance';

/**
 * パフォーマンスアダプター
 *
 * @class PerformanceAdapter
 */
export default class PerformanceAdapter {
    public readonly model: typeof performanceModel;

    constructor(connection: Connection) {
        this.model = connection.model(performanceModel.modelName);
    }
}
