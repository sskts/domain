"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("./mongoose/model/task");
/**
 * タスクアダプター
 *
 * @class TaskAdapter
 */
class TaskAdapter {
    constructor(connection) {
        this.taskModel = connection.model(task_1.default.modelName);
    }
}
exports.default = TaskAdapter;
