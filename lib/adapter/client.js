"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clientEvent_1 = require("./mongoose/model/clientEvent");
/**
 * アプリケーションクライアントアダプター
 *
 * @class ClientAdapter
 */
class ClientAdapter {
    constructor(connection) {
        this.clientEventModel = connection.model(clientEvent_1.default.modelName);
    }
}
exports.default = ClientAdapter;
