"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createFromCOA(performanceFromCOA) {
    return (screen, film) => {
        const id = [
            screen.theater,
            performanceFromCOA.date_jouei,
            performanceFromCOA.title_code,
            performanceFromCOA.title_branch_num,
            performanceFromCOA.screen_code,
            performanceFromCOA.time_begin
        ].join('');
        return {
            id: id,
            theater: screen.theater,
            screen: screen.id,
            film: film.id,
            day: performanceFromCOA.date_jouei,
            time_start: performanceFromCOA.time_begin,
            time_end: performanceFromCOA.time_end,
            canceled: false
        };
    };
}
exports.createFromCOA = createFromCOA;
