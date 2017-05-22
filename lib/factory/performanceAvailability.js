"use strict";
/**
 * パフォーマンス空席状況ファクトリー
 * todo jsdoc
 *
 * @namespace factory/performanceAvailability
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
var Availability;
(function (Availability) {
    Availability.MANY = '○';
    Availability.FEW = '△';
    Availability.UNAVAILABLE = '×';
    Availability.EXPIRED = '-';
})(Availability = exports.Availability || (exports.Availability = {}));
function create(day, numberOfAvailableSeats, numberOfAllSeats) {
    // 上映日当日過ぎていれば期限切れ
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(day, 10) < parseInt(moment().format('YYYYMMDD'), 10)) {
        return Availability.EXPIRED;
    }
    // 残席数よりステータスを算出
    // tslint:disable-next-line:no-magic-numbers
    if (30 * numberOfAllSeats < 100 * numberOfAvailableSeats) {
        return Availability.MANY;
    }
    if (0 < numberOfAvailableSeats) {
        return Availability.FEW;
    }
    // 残席0以下なら問答無用に×
    return Availability.UNAVAILABLE;
}
exports.create = create;
