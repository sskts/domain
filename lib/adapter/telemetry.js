"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("./mongoose/model/telemetry");
/**
 * 測定アダプター
 *
 * @class TelemetryAdapter
 */
class TelemetryAdapter {
    constructor(connection) {
        this.telemetryModel = connection.model(telemetry_1.default.modelName);
    }
}
exports.default = TelemetryAdapter;
