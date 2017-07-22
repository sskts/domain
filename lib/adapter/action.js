"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("./mongoose/model/action");
/**
 * アクションアダプター
 *
 * @class ActionAdapter
 */
class ActionAdapter {
    constructor(connection) {
        this.actionModel = connection.model(action_1.default.modelName);
    }
}
exports.default = ActionAdapter;
