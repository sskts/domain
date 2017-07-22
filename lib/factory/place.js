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
        sameAs: (args.sameAs !== undefined) ? args.sameAs.toString() : undefined,
        typeOf: args.typeOf
    };
}
exports.create = create;
