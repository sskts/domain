"use strict";
/**
 * ムビチケ承認資産移動タスクファクトリー
 *
 * @namespace factory/task/settleMvtk
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TaskFactory = require("../task");
const taskName_1 = require("../taskName");
function create(args) {
    // todo validation
    return TaskFactory.create(Object.assign({}, args, { name: taskName_1.default.SettleMvtk }));
}
exports.create = create;
