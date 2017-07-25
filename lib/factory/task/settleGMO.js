"use strict";
/**
 * GMO承認資産移動タスクファクトリー
 *
 * @namespace factory/task/settleGMO
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TaskFactory = require("../task");
const taskName_1 = require("../taskName");
function create(args) {
    // todo validation
    return TaskFactory.create(Object.assign({}, args, { name: taskName_1.default.SettleGMO }));
}
exports.create = create;
