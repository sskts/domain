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
    if (!_.isDate(args.runsAt)) {
        throw new argument_1.default('runsAt', 'runsAt should be Date');
    }
    if (!_.isNumber(args.remainingNumberOfTries)) {
        throw new argument_1.default('remainingNumberOfTries', 'remainingNumberOfTries should be number');
    }
    if (!_.isNull(args.lastTriedAt) && !_.isDate(args.lastTriedAt)) {
        throw new argument_1.default('lastTriedAt', 'lastTriedAt should be Date or null');
    }
    if (!_.isNumber(args.numberOfTried)) {
        throw new argument_1.default('numberOfTried', 'numberOfTried should be number');
    }
    if (!_.isArray(args.executionResults)) {
        throw new argument_1.default('executionResults', 'executionResults should be array');
    }
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        name: args.name,
        status: args.status,
        runsAt: args.runsAt,
        remainingNumberOfTries: args.remainingNumberOfTries,
        lastTriedAt: args.lastTriedAt,
        numberOfTried: args.numberOfTried,
        executionResults: args.executionResults,
        data: args.data
    };
}
exports.create = create;
