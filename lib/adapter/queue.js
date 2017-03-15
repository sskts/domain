"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./mongoose/model/queue");
class QueueAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(queue_1.default.modelName);
    }
}
exports.default = QueueAdapter;
