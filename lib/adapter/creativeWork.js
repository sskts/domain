"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const creativeWork_1 = require("./mongoose/model/creativeWork");
/**
 * 作品アダプター
 *
 * @class CreativeWorkAdapter
 */
class CreativeWorkAdapter {
    constructor(connection) {
        this.creativeWorkModel = connection.model(creativeWork_1.default.modelName);
    }
}
exports.default = CreativeWorkAdapter;
