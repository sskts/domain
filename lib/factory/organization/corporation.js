"use strict";
/**
 * 企業ファクトリー
 *
 * @namespace factory/organization/corporation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const OrganizationFactory = require("../organization");
const organizationType_1 = require("../organizationType");
function create(args) {
    const organization = OrganizationFactory.create({
        identifier: args.identifier,
        name: args.name,
        legalName: args.legalName,
        typeOf: organizationType_1.default.Corporation
    });
    return Object.assign({}, organization, {
        identifier: args.identifier
    });
}
exports.create = create;
