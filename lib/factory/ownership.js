"use strict";
const objectId_1 = require("../model/objectId");
const ownership_1 = require("../model/ownership");
/**
 * 所有権ファクトリー
 *
 * @namespace
 */
var OwnershipFactory;
(function (OwnershipFactory) {
    function create(args) {
        return new ownership_1.default((args._id) ? args._id : objectId_1.default(), args.owner, args.authenticated);
    }
    OwnershipFactory.create = create;
})(OwnershipFactory || (OwnershipFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OwnershipFactory;
