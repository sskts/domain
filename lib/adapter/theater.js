"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const theater_1 = require("./mongoose/model/theater");
class TheaterAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(theater_1.default.modelName);
    }
}
exports.default = TheaterAdapter;
