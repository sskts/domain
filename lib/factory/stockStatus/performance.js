"use strict";
/**
 * パフォーマンス在庫状況ファクトリー
 * todo jsdoc
 *
 * @namespace factory/performanceStockStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const stockStatusGroup_1 = require("../stockStatusGroup");
/**
 * パフォーマンス在庫状況表現
 */
var Expression;
(function (Expression) {
    Expression.AVAILABLE_MANY = '○';
    Expression.AVAILABLE_FEW = '△';
    Expression.UNAVAILABLE = '×';
    Expression.EXPIRED = '-';
})(Expression = exports.Expression || (exports.Expression = {}));
/**
 * 座席数から在庫状況表現を生成する
 *
 * @param {string} day 上映日
 * @param {number} numberOfAvailableSeats 空席数
 * @param {number} numberOfAllSeats 全座席数
 * @returns {Expression} 在庫状況表現
 */
function createExpression(day, numberOfAvailableSeats, numberOfAllSeats) {
    // 上映日当日過ぎていれば期限切れ
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(day, 10) < parseInt(moment().format('YYYYMMDD'), 10)) {
        return Expression.EXPIRED;
    }
    // 残席数よりステータスを算出
    // tslint:disable-next-line:no-magic-numbers
    if (30 * numberOfAllSeats < 100 * numberOfAvailableSeats) {
        return Expression.AVAILABLE_MANY;
    }
    if (0 < numberOfAvailableSeats) {
        return Expression.AVAILABLE_FEW;
    }
    // 残席0以下なら問答無用に×
    return Expression.UNAVAILABLE;
}
exports.createExpression = createExpression;
function create(args) {
    return {
        id: `${stockStatusGroup_1.default.PERFORMANCE}${args.performaceId}`,
        group: stockStatusGroup_1.default.PERFORMANCE,
        expression: args.expression
    };
}
exports.create = create;
