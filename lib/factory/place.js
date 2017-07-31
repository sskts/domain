"use strict";
/**
 * 場所ファクトリー
 *
 * @namespace factory/place
 */
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    return {
        id: args.id,
        name: args.name,
        description: args.description,
        address: args.address,
        branchCode: args.branchCode,
        containedInPlace: args.containedInPlace,
        containsPlace: args.containsPlace,
        maximumAttendeeCapacity: args.maximumAttendeeCapacity,
        openingHoursSpecification: args.openingHoursSpecification,
        smokingAllowed: args.smokingAllowed,
        telephone: args.telephone,
        url: (args.url !== undefined) ? args.url.toString() : undefined,
        typeOf: args.typeOf
    };
}
exports.create = create;
