"use strict";
/**
 * 注文作成タスクファクトリー
 *
 * @namespace factory/task/createOrder
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TaskFactory = require("../task");
const taskName_1 = require("../taskName");
function create(args) {
    // todo validation
    return TaskFactory.create(Object.assign({}, args, { name: taskName_1.default.CreateOrder }));
}
exports.create = create;
