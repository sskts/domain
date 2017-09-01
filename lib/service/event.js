"use strict";
/**
 * event service
 * イベントサービス
 * @namespace service/event
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const debug = createDebug('sskts-domain:service:event');
/**
 * search individualScreeningEvents
 * @export
 * @function
 * @memberof service/event
 */
function searchIndividualScreeningEvents(searchConditions) {
    return (eventRepository, itemAvailabilityRepository) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: factory.eventType.IndividualScreeningEvent
        };
        if (searchConditions.day !== undefined) {
            conditions.startDate = {
                $gte: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').toDate(),
                $lt: moment(`${searchConditions.day} +09:00`, 'YYYYMMDD Z').add(1, 'day').toDate()
            };
        }
        if (searchConditions.theater !== undefined) {
            conditions['superEvent.location.branchCode'] = searchConditions.theater;
        }
        debug('finding individualScreeningEvents...', conditions);
        const events = yield eventRepository.eventModel.find(conditions)
            .sort({ startDate: 1 })
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();
        return yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
            // add item availability info
            const offer = {
                typeOf: 'Offer',
                availability: null,
                url: ''
            };
            if (itemAvailabilityRepository !== undefined) {
                offer.availability = yield itemAvailabilityRepository.findOne(event.coaInfo.dateJouei, event.identifier);
            }
            return Object.assign({}, event, {
                offer: offer
            });
        })));
    });
}
exports.searchIndividualScreeningEvents = searchIndividualScreeningEvents;
/**
 * find individualScreeningEvent by identifier
 * @export
 * @function
 * @memberof service/event
 */
function findIndividualScreeningEventByIdentifier(identifier) {
    return (eventRepository, itemAvailabilityRepository) => __awaiter(this, void 0, void 0, function* () {
        const event = yield eventRepository.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();
        if (event === null) {
            throw new factory.errors.NotFound('individualScreeningEvent');
        }
        // add item availability info
        const offer = {
            typeOf: 'Offer',
            availability: null,
            url: ''
        };
        if (itemAvailabilityRepository !== undefined) {
            offer.availability = yield itemAvailabilityRepository.findOne(event.coaInfo.dateJouei, event.identifier);
        }
        return Object.assign({}, event, {
            offer: offer
        });
    });
}
exports.findIndividualScreeningEventByIdentifier = findIndividualScreeningEventByIdentifier;
