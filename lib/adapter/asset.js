"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asset_1 = require("./mongoose/model/asset");
class AssetAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(asset_1.default.modelName);
    }
}
exports.default = AssetAdapter;
