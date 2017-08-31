import { Connection } from 'mongoose';
import telemetryModel from './mongoose/model/telemetry';

/**
 * 測定レポジトリー
 *
 * @class TelemetryRepository
 */
export default class TelemetryRepository {
    public readonly telemetryModel: typeof telemetryModel;

    constructor(connection: Connection) {
        this.telemetryModel = connection.model(telemetryModel.modelName);
    }
}
