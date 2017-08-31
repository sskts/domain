"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("./mongoose/model/telemetry");
/**
 * 測定レポジトリー
 *
 * @class TelemetryRepository
 */
class TelemetryRepository {
    constructor(connection) {
        this.telemetryModel = connection.model(telemetry_1.default.modelName);
    }
}
exports.default = TelemetryRepository;
