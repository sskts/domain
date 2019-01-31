import { mongoose } from '@cinerino/domain';
import telemetryModel from './mongoose/model/telemetry';

/**
 * 測定リポジトリ
 */
export class MongoRepository {
    public readonly telemetryModel: typeof telemetryModel;

    constructor(connection: mongoose.Connection) {
        this.telemetryModel = connection.model(telemetryModel.modelName);
    }
}
