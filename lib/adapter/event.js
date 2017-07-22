"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("./mongoose/model/event");
/**
 * イベントアダプター
 *
 * @class EventAdapter
 */
class EventAdapter {
    constructor(connection) {
        this.eventModel = connection.model(event_1.default.modelName);
    }
}
exports.default = EventAdapter;
