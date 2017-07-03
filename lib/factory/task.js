"use strict";
/**
 * タスクファクトリー
 *
 * @namespace factory/task
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../error/argument");
const argumentNull_1 = require("../error/argumentNull");
const objectId_1 = require("./objectId");
function create(args) {
    // todo validation
    if (_.isEmpty(args.status)) {
        throw new argumentNull_1.default('status');
    }
    if (!_.isDate(args.runs_at)) {
        throw new argument_1.default('runs_at', 'run_at should be Date');
    }
    if (!_.isNumber(args.max_number_of_try)) {
        throw new argument_1.default('max_number_of_try', 'max_number_of_try should be number');
    }
    if (!_.isNull(args.last_tried_at) && !_.isDate(args.last_tried_at)) {
        throw new argument_1.default('last_tried_at', 'last_tried_at should be Date or null');
    }
    if (!_.isNumber(args.number_of_tried)) {
        throw new argument_1.default('number_of_tried', 'number_of_tried should be number');
    }
    if (!_.isArray(args.execution_results)) {
        throw new argument_1.default('execution_results', 'execution_results should be array');
    }
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        name: args.name,
        status: args.status,
        runs_at: args.runs_at,
        max_number_of_try: args.max_number_of_try,
        last_tried_at: args.last_tried_at,
        number_of_tried: args.number_of_tried,
        execution_results: args.execution_results,
        data: args.data
    };
}
exports.create = create;
