import { Connection } from 'mongoose';
import performanceModel from './mongoose/model/performance';

/**
 * パフォーマンスアダプター
 *
 * @export
 * @class PerformanceAdapter
 */
export default class PerformanceAdapter {
    public model: typeof performanceModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(performanceModel.modelName);
    }
}
