"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./mongoose/model/queue");
/**
 * キューアダプター
 *
 * @class QueueAdapter
 */
class QueueAdapter {
    constructor(connection) {
        this.model = connection.model(queue_1.default.modelName);
    }
}
exports.default = QueueAdapter;
