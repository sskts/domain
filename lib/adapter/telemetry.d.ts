/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import telemetryModel from './mongoose/model/telemetry';
/**
 * 測定アダプター
 *
 * @class TelemetryAdapter
 */
export default class TelemetryAdapter {
    readonly telemetryModel: typeof telemetryModel;
    constructor(connection: Connection);
}
