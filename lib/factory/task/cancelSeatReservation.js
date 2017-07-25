"use strict";
/**
 * 座席予約承認解除タスクファクトリー
 *
 * @namespace factory/task/cancelSeatReservation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TaskFactory = require("../task");
const taskName_1 = require("../taskName");
function create(args) {
    // todo validation
    return TaskFactory.create(Object.assign({}, args, { name: taskName_1.default.CancelSeatReservation }));
}
exports.create = create;
