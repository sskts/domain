"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./mongoose/model/client");
const clientEvent_1 = require("./mongoose/model/clientEvent");
/**
 * アプリケーションクライアントアダプター
 *
 * @class ClientAdapter
 */
class ClientAdapter {
    constructor(connection) {
        this.clientModel = connection.model(client_1.default.modelName);
        this.clientEventModel = connection.model(clientEvent_1.default.modelName);
    }
}
exports.default = ClientAdapter;
