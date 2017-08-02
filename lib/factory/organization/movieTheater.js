"use strict";
/**
 * 劇場組織ファクトリー
 *
 * @namespace factory/organization/movieTheater
 */
Object.defineProperty(exports, "__esModule", { value: true });
const OrganizationFactory = require("../organization");
const organizationType_1 = require("../organizationType");
function create(args) {
    const identifier = `MovieTheaterOrganization-${args.branchCode}`;
    return Object.assign({}, OrganizationFactory.create({
        identifier: identifier,
        name: args.name,
        typeOf: organizationType_1.default.MovieTheater
    }), {
        branchCode: args.branchCode,
        gmoInfo: args.gmoInfo,
        parentOrganization: args.parentOrganization,
        location: args.location,
        telephone: args.telephone,
        url: args.url
    });
}
exports.create = create;
