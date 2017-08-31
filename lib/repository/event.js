"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("./mongoose/model/event");
/**
 * イベントレポジトリー
 *
 * @class EventRepository
 */
class EventRepository {
    constructor(connection) {
        this.eventModel = connection.model(event_1.default.modelName);
    }
}
exports.default = EventRepository;
