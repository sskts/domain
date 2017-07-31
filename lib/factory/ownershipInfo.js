"use strict";
/**
 * 所有権ファクトリー
 *
 * @namespace factory/ownership
 */
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    return {
        identifier: `Reservation-${args.typeOfGood.reservationNumber}`,
        ownedBy: args.ownedBy,
        acquiredFrom: args.acquiredFrom,
        ownedFrom: args.ownedFrom,
        ownedThrough: args.ownedThrough,
        typeOfGood: args.typeOfGood
    };
}
exports.create = create;
