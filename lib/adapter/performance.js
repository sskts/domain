"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const performance_1 = require("./mongoose/model/performance");
/**
 * パフォーマンスアダプター
 *
 * @export
 * @class PerformanceAdapter
 */
class PerformanceAdapter {
    constructor(connection) {
        this.model = connection.model(performance_1.default.modelName);
    }
}
exports.default = PerformanceAdapter;
