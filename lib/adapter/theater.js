"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const theater_1 = require("./mongoose/model/theater");
/**
 * 劇場アダプター
 *
 * @export
 * @class TheaterAdapter
 */
class TheaterAdapter {
    constructor(connection) {
        this.model = connection.model(theater_1.default.modelName);
    }
}
exports.default = TheaterAdapter;
