"use strict";
/**
 * 取引照会無効化タスクファクトリー
 *
 * @namespace factory/task/disableTransactionInquiry
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TaskFactory = require("../task");
const taskName_1 = require("../taskName");
function create(args) {
    // todo validation
    return TaskFactory.create(Object.assign({}, args, { name: taskName_1.default.DisableTransactionInquiry }));
}
exports.create = create;
