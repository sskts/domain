"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clientEvent_1 = require("./mongoose/model/clientEvent");
/**
 * アプリケーションクライアントレポジトリー
 *
 * @class ClientRepository
 */
class ClientRepository {
    constructor(connection) {
        this.clientEventModel = connection.model(clientEvent_1.default.modelName);
    }
}
exports.default = ClientRepository;
