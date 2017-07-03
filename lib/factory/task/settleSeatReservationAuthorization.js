"use strict";
/**
 * 座席予約承認資産移動ファクトリー
 *
 * @namespace factory/task/settleSeatReservationAuthorization
 */
Object.defineProperty(exports, "__esModule", { value: true });
const TaskFactory = require("../task");
const taskName_1 = require("../taskName");
function create(args) {
    // todo validation
    return TaskFactory.create(Object.assign({}, args, { name: taskName_1.default.SettleSeatReservationAuthorization }));
}
exports.create = create;
