"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("./mongoose/model/task");
/**
 * タスクレポジトリー
 *
 * @class TaskRepository
 */
class TaskRepository {
    constructor(connection) {
        this.taskModel = connection.model(task_1.default.modelName);
    }
}
exports.default = TaskRepository;
