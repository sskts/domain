"use strict";
/**
 * イベントサービス
 *
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
// import PerformanceStockStatusAdapter from '../adapter/stockStatus/performance';
const debug = createDebug('sskts-domain:service:event');
/**
 * 上映イベントインポート
 */
function importScreeningEvents(theaterCode, importFrom, importThrough) {
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
        const performances = yield COA.services.master.schedule({
            theaterCode: theaterCode,
            begin: moment(importFrom).locale('ja').format('YYYYMMDD'),
            end: moment(importThrough).locale('ja').format('YYYYMMDD')
        });
        // 永続化
        const screeningEvents = yield Promise.all(filmsFromCOA.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEvent = factory.event.screeningEvent.createFromCOA(filmFromCOA)(movieTheater);
            debug('storing screeningEvent...', filmFromCOA, screeningEvent);
            yield eventAdapter.eventModel.findOneAndUpdate({
                identifier: screeningEvent.identifier,
                typeOf: factory.eventType.ScreeningEvent
            }, screeningEvent, { upsert: true }).exec();
            debug('screeningEvent stored.');
            return screeningEvent;
        })));
        // パフォーマンスごとに永続化トライ
        yield Promise.all(performances.map((performanceFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const screeningEventIdentifier = factory.event.screeningEvent.createIdentifier(theaterCode, performanceFromCOA.titleCode, performanceFromCOA.titleBranchNum);
            // スクリーン存在チェック
            const screenRoom = movieTheater.containsPlace.find((place) => place.branchCode === performanceFromCOA.screenCode);
            if (screenRoom === undefined) {
                console.error('screenRoom not found.', performanceFromCOA.screenCode);
                return;
            }
            // 上映イベント取得
            const screeningEvent = screeningEvents.find((event) => event.identifier === screeningEventIdentifier);
            if (screeningEvent === undefined) {
                console.error('screeningEvent not found.', screeningEventIdentifier);
                return;
            }
            // 永続化
            const individualScreeningEvent = factory.event.individualScreeningEvent.createFromCOA(performanceFromCOA)(screenRoom, screeningEvent);
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
 * 上映イベント検索
 * 空席状況情報がなかったバージョンに対して互換性を保つために
 * performanceStockStatusAdapterはundefinedでも使えるようになっている
 */
function searchIndividualScreeningEvents(searchConditions) {
    return (eventAdapter
        // performanceStockStatusAdapter?: PerformanceStockStatusAdapter
    ) => __awaiter(this, void 0, void 0, function* () {
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
        return yield eventAdapter.eventModel.find(conditions)
            .sort({ startDate: 1 })
            .setOptions({ maxTimeMS: 10000 })
            .lean()
            .exec();
        // const performances: ISearchPerformancesResult[] = [];
        // await Promise.all(docs.map(async (doc) => {
        //     // 空席状況を追加
        //     let stockStatus = null;
        //     if (performanceStockStatusAdapter !== undefined) {
        //         stockStatus = await performanceStockStatusAdapter.findOne(doc.get('day'), doc.get('id'));
        //         debug('stockStatus:', stockStatus);
        //     }
        //     performances.push({
        //         id: doc.get('id'),
        //         theater: {
        //             id: doc.get('theater').id,
        //             name: doc.get('theater').name
        //         },
        //         screen: {
        //             id: doc.get('screen').id,
        //             name: doc.get('screen').name
        //         },
        //         film: {
        //             id: doc.get('film').id,
        //             name: doc.get('film').name,
        //             minutes: doc.get('film').minutes
        //         },
        //         day: doc.get('day'),
        //         time_start: doc.get('time_start'),
        //         time_end: doc.get('time_end'),
        //         canceled: doc.get('canceled'),
        //         stock_status: (stockStatus === null) ? null : stockStatus.expression
        //     });
        // }));
        // return performances;
    });
}
exports.searchIndividualScreeningEvents = searchIndividualScreeningEvents;
/**
 * IDで上映イベント検索
 */
function findIndividualScreeningEventByIdentifier(identifier) {
    return (eventAdapter) => __awaiter(this, void 0, void 0, function* () {
        const event = yield eventAdapter.eventModel.findOne({
            typeOf: factory.eventType.IndividualScreeningEvent,
            identifier: identifier
        }).lean().exec();
        return (event === null) ? monapt.None : monapt.Option(event);
    });
}
exports.findIndividualScreeningEventByIdentifier = findIndividualScreeningEventByIdentifier;
