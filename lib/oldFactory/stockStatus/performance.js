"use strict";
/**
 * パフォーマンス在庫状況ファクトリー
 *
 * @namespace factory/performanceStockStatus
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const argument_1 = require("../../error/argument");
const stockStatusGroup_1 = require("../stockStatusGroup");
/**
 * 座席数から在庫状況表現を生成する
 *
 * @param {number} numberOfAvailableSeats 空席数
 * @param {number} numberOfAllSeats 全座席数
 * @returns {Expression} 在庫状況表現
 */
function createExpression(numberOfAvailableSeats, numberOfAllSeats) {
    if (!_.isNumber(numberOfAvailableSeats)) {
        throw new argument_1.default('numberOfAvailableSeats', 'numberOfAvailableSeats should be number');
    }
    if (!_.isNumber(numberOfAllSeats)) {
        throw new argument_1.default('numberOfAllSeats', 'numberOfAllSeats should be number');
    }
    if (numberOfAllSeats === 0) {
        return 0;
    }
    // 残席数より空席率を算出
    // tslint:disable-next-line:no-magic-numbers
    return Math.floor(numberOfAvailableSeats / numberOfAllSeats * 100);
}
exports.createExpression = createExpression;
/**
 * パフォーマンス在庫状況を作成する
 *
 * @export
 * @param {string} args.performaceId パフォーマンスID
 * @param {Expression} args.expression 在庫状況表現
 * @returns {IStockStatus} パフォーマンス在庫状況
 */
function create(args) {
    return {
        id: `${stockStatusGroup_1.default.PERFORMANCE}:${args.performaceId}`,
        group: stockStatusGroup_1.default.PERFORMANCE,
        expression: args.expression
    };
}
exports.create = create;
