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
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:event');
/**
 * search individualScreeningEvents
 * @export
 * @function
 * @memberof service/event
 */
function searchIndividualScreeningEvents(searchConditions) {
    return (eventRepository, itemAvailabilityRepository) => __awaiter(this, void 0, void 0, function* () {
        debug('finding individualScreeningEvents...', searchConditions);
        const events = yield eventRepository.searchIndividualScreeningEvents(searchConditions);
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
        const event = yield eventRepository.findIndividualScreeningEventByIdentifier(identifier);
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
