"use strict";
const performance_1 = require("../model/performance");
/**
 * パフォーマンスファクトリー
 *
 * @namespace
 */
var PerformanceFactory;
(function (PerformanceFactory) {
    function create(args) {
        return new performance_1.default(args._id, args.theater, args.screen, args.film, args.day, args.time_start, args.time_end, args.canceled);
    }
    PerformanceFactory.create = create;
    function createFromCOA(performanceFromCOA) {
        return (screen, film) => {
            const id = [
                screen.theater._id,
                performanceFromCOA.date_jouei,
                performanceFromCOA.title_code,
                performanceFromCOA.title_branch_num,
                performanceFromCOA.screen_code,
                performanceFromCOA.time_begin,
            ].join();
            return create({
                _id: id,
                theater: screen.theater,
                screen: screen,
                film: film,
                day: performanceFromCOA.date_jouei,
                time_start: performanceFromCOA.time_begin,
                time_end: performanceFromCOA.time_end,
                canceled: false,
            });
        };
    }
    PerformanceFactory.createFromCOA = createFromCOA;
})(PerformanceFactory || (PerformanceFactory = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceFactory;
