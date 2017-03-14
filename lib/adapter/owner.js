"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const owner_1 = require("./mongoose/model/owner");
class OwnerAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(owner_1.default.modelName);
    }
}
exports.default = OwnerAdapter;
