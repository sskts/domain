"use strict";
/**
 * 所有権ファクトリー
 *
 * @namespace factory/ownership
 */
Object.defineProperty(exports, "__esModule", { value: true });
var OwnerType;
(function (OwnerType) {
    OwnerType["Organization"] = "Organization";
    OwnerType["Person"] = "Person";
})(OwnerType = exports.OwnerType || (exports.OwnerType = {}));
function create(args) {
    return {
        identifier: `Reservation-${args.typeOfGood.reservationNumber}`,
        acquiredFrom: args.acquiredFrom,
        ownedFrom: args.ownedFrom,
        ownedThrough: args.ownedThrough,
        typeOfGood: args.typeOfGood
    };
}
exports.create = create;
