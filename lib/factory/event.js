"use strict";
/**
 * イベントファクトリー
 *
 * @namespace factory/event
 */
Object.defineProperty(exports, "__esModule", { value: true });
function create(args) {
    return {
        identifier: args.identifier,
        name: (args.name === undefined) ? { ja: '', en: '' } : args.name,
        description: args.description,
        doorTime: args.doorTime,
        duration: (args.duration === undefined) ? undefined : args.duration.toString(),
        endDate: args.endDate,
        eventStatus: args.eventStatus,
        location: args.location,
        startDate: args.startDate,
        workPerformed: args.workPerformed,
        maximumAttendeeCapacity: args.maximumAttendeeCapacity,
        offers: args.offers,
        remainingAttendeeCapacity: args.remainingAttendeeCapacity,
        typeOf: args.typeOf
    };
}
exports.create = create;
