"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectId_1 = require("../objectId");
const transactionEventGroup_1 = require("../transactionEventGroup");
function create(args) {
    return {
        id: (args.id === undefined) ? objectId_1.default().toString() : args.id,
        group: transactionEventGroup_1.default.UNAUTHORIZE,
        transaction: args.transaction,
        occurred_at: args.occurred_at,
        authorization: args.authorization
    };
}
exports.create = create;
