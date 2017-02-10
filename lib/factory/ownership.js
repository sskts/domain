/**
 * 所有権ファクトリー
 *
 * @namespace OwnershipFactory
 */
"use strict";
const objectId_1 = require("../model/objectId");
const ownership_1 = require("../model/ownership");
function create(args) {
    return new ownership_1.default((args._id) ? args._id : objectId_1.default(), args.owner, args.authenticated);
}
exports.create = create;
