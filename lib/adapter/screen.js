"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const screen_1 = require("./mongoose/model/screen");
class ScreenAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(screen_1.default.modelName);
    }
}
exports.default = ScreenAdapter;
