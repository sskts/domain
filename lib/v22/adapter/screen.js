"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const screen_1 = require("./mongoose/model/screen");
/**
 * スクリーンアダプター
 *
 * @class ScreenAdapter
 */
class ScreenAdapter {
    constructor(connection) {
        this.model = connection.model(screen_1.default.modelName);
    }
}
exports.default = ScreenAdapter;
