"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * オーソリ解除キューファクトリー
 *
 * @namespace CancelAuthorizationQueueFactory
 */
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const argumentNull_1 = require("../../error/argumentNull");
const objectId_1 = require("../objectId");
const queueGroup_1 = require("../queueGroup");
function create(args) {
    if (_.isEmpty(args.authorization))
        throw new argumentNull_1.default('authorization');
    if (_.isEmpty(args.status))
        throw new argumentNull_1.default('status');
    if (!_.isDate(args.run_at))
        throw new argument_1.default('run_at', 'run_at should be Date');
    if (!_.isNumber(args.max_count_try))
        throw new argument_1.default('max_count_try', 'max_count_try should be number');
    if (!_.isNull(args.last_tried_at) && !_.isDate(args.last_tried_at)) {
        throw new argument_1.default('last_tried_at', 'last_tried_at should be Date or null');
    }
    if (!_.isNumber(args.count_tried))
        throw new argument_1.default('count_tried', 'count_tried should be number');
    if (!_.isArray(args.results))
        throw new argument_1.default('results', 'results should be array');
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: queueGroup_1.default.CANCEL_AUTHORIZATION,
        status: args.status,
        run_at: args.run_at,
        max_count_try: args.max_count_try,
        last_tried_at: args.last_tried_at,
        count_tried: args.count_tried,
        results: args.results,
        authorization: args.authorization
    };
}
exports.create = create;
