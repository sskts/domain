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
const COA = require("@motionpicture/coa-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const argument_1 = require("../error/argument");
const debug = createDebug('sskts-domain:service:event');
/**
 * import screening events from COA
 * COAから上映イベントをインポートする
 * @export
 * @function
 * @memberof service/event
 */
function importScreeningEvents(theaterCode, importFrom, importThrough) {
    // tslint:disable-next-line:max-func-body-length
    return (eventAdapter, placeAdapter) => __awaiter(this, void 0, void 0, function* () {
        // 劇場取得
        const movieTheaterDoc = yield placeAdapter.placeModel.findOne({
            branchCode: theaterCode,
            typeOf: factory.placeType.MovieTheater
        }).exec();
        if (movieTheaterDoc === null) {
            throw new argument_1.default('movieTheater not found.');
        }
        const movieTheater = movieTheaterDoc.toObject();
        // COAから作品取得
        const filmsFromCOA = yield COA.services.master.title({
            theaterCode: theaterCode
        });
        // COAからパフォーマンス取得
        const schedulesFromCOA = yield COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });
        // COAから区分マスター抽出
        const serviceKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '009'
        });
        const acousticKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '046'
        });
        const eirinKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '044'
        });
        const eizouKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '042'
        });
        const joueihousikiKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '045'
        });
        const jimakufukikaeKubuns = yield COA.services.master.kubunName({
            theaterCode: theaterCode,
            kubunClass: '043'
        });
        debug(serviceKubuns, acousticKubuns, eirinKubuns, eizouKubuns, joueihousikiKubuns, jimakufukikaeKubuns);
        // 永続化
        const screeningEvents = yield Promise.all(filmsFromCOA.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEvent = factory.event.screeningEvent.createFromCOA({
                filmFromCOA: filmFromCOA,
                movieTheater: movieTheater,
                eirinKubuns: eirinKubuns,
                eizouKubuns: eizouKubuns,
                joueihousikiKubuns: joueihousikiKubuns,
                jimakufukikaeKubuns: jimakufukikaeKubuns
            });
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            yield eventAdapter.eventModel.findOneAndUpdate({
                identifier: screeningEvent.identifier,
                typeOf: factory.eventType.ScreeningEvent
            }, screeningEvent, { upsert: true }).exec();
            debug('screeningEvent stored.');
            return screeningEvent;
        })));
        // パフォーマンスごとに永続化トライ
        yield Promise.all(schedulesFromCOA.map((scheduleFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier(theaterCode, scheduleFromCOA.titleCode, scheduleFromCOA.titleBranchNum);
            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find((place) => place.branchCode === scheduleFromCOA.screenCode);
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', scheduleFromCOA.screenCode);
                return;
            }
            // 上映イベント取得
            const screeningEvent = screeningEvents.find((event) => event.identifier === screeningEventIdentifier);
            if (screeningEvent === undefined) {
                console.error('screeningEvent not found.', screeningEventIdentifier);
                return;
            }
            // 永続化
            const individualScreeningEvent = factory.event.individualScreeningEvent.createFromCOA({
                performanceFromCOA: scheduleFromCOA,
                screenRoom: screenRoom,
                screeningEvent: screeningEvent,
                serviceKubuns: serviceKubuns,
                acousticKubuns: acousticKubuns
            });
            debug('storing individualScreeningEvent', individualScreeningEvent);
            yield eventAdapter.eventModel.findOneAndUpdate({
                identifier: individualScreeningEvent.identifier,
                typeOf: factory.eventType.IndividualScreeningEvent
            }, individualScreeningEvent, { new: true, upsert: true }).exec();
            debug('individualScreeningEvent stored.');
        })));
    });
}
exports.importScreeningEvents = importScreeningEvents;
/**
 * search individualScreeningEvents
 * @export
 * @function
 * @memberof service/event
 */
function searchIndividualScreeningEvents(searchConditions) {
    return (eventAdapter, itemAvailabilityAdapter) => __awaiter(this, void 0, void 0, function* () {
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
        const events = yield eventAdapter.eventModel.find(conditions)
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
            if (itemAvailabilityAdapter !== undefined) {
                offer.availability = yield itemAvailabilityAdapter.findOne(event.coaInfo.dateJouei, event.identifier);
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
    return (eventAdapter, itemAvailabilityAdapter) => __awaiter(this, void 0, void 0, function* () {
        const event = yield eventAdapter.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();
        if (event === null) {
            return monapt.None;
        }
        // add item availability info
        const offer = {
            typeOf: 'Offer',
            availability: null,
            url: ''
        };
        if (itemAvailabilityAdapter !== undefined) {
            offer.availability = yield itemAvailabilityAdapter.findOne(event.coaInfo.dateJouei, event.identifier);
        }
        return monapt.Option(Object.assign({}, event, {
            offer: offer
        }));
    });
}
exports.findIndividualScreeningEventByIdentifier = findIndividualScreeningEventByIdentifier;
