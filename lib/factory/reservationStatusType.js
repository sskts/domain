"use strict";
/**
 * 予約ステータス
 *
 * @namespace factory/reservationStatusType
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ReservationStatusType;
(function (ReservationStatusType) {
    ReservationStatusType["ReservationCancelled"] = "ReservationCancelled";
    ReservationStatusType["ReservationConfirmed"] = "ReservationConfirmed";
    ReservationStatusType["ReservationHold"] = "ReservationHold";
    ReservationStatusType["ReservationPending"] = "ReservationPending";
})(ReservationStatusType || (ReservationStatusType = {}));
exports.default = ReservationStatusType;
