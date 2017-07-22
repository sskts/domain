"use strict";
/**
 * イベントステータス
 *
 * @namespace/factory/eventStatusType
 */
Object.defineProperty(exports, "__esModule", { value: true });
var EventStatusType;
(function (EventStatusType) {
    EventStatusType["EventCancelled"] = "EventCancelled";
    EventStatusType["EventPostponed"] = "EventPostponed";
    EventStatusType["EventRescheduled"] = "EventRescheduled";
    EventStatusType["EventScheduled"] = "EventScheduled";
})(EventStatusType || (EventStatusType = {}));
exports.default = EventStatusType;
